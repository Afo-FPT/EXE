import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import jwt from 'jsonwebtoken';

import { connectDB } from '@/lib/db';
import Review from '@/lib/models/Review';
import User from '@/lib/models/User';

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB

const getTokenPayload = (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as jwt.JwtPayload;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50', 10),
      100
    );

    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Không thể tải danh sách đánh giá',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getTokenPayload(request.headers.get('authorization'));
    if (!payload?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bạn cần đăng nhập để gửi đánh giá',
        },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(payload.id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không tìm thấy người dùng',
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const rating = Number(formData.get('rating'));
    const title = (formData.get('title') || '').toString().trim();
    const content = (formData.get('content') || '').toString().trim();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: 'Điểm đánh giá không hợp lệ',
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nội dung đánh giá không được bỏ trống',
        },
        { status: 400 }
      );
    }

    const files = (formData.getAll('images') as File[]).filter(
      (file) => file && file.size > 0
    );
    if (files.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          success: false,
          message: `Chỉ được tải tối đa ${MAX_IMAGES} ảnh`,
        },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'reviews'
    );
    await mkdir(uploadsDir, { recursive: true });

    const imagePaths: string[] = [];
    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: `Ảnh "${file.name}" vượt quá 8MB`,
          },
          { status: 400 }
        );
      }
      const ext = path.extname(file.name) || '.jpg';
      const filename = `review-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadsDir, filename), buffer);
      imagePaths.push(`/uploads/reviews/${filename}`);
    }

    const review = await Review.create({
      userId: user._id,
      username: user.username || user.email,
      avatar: user.avatar || '',
      rating,
      title,
      content,
      images: imagePaths,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Đánh giá đã được gửi thành công',
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Không thể gửi đánh giá',
      },
      { status: 500 }
    );
  }
}


