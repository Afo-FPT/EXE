# Disable 3D Viewer Components

## Files to modify:

1. **ChessPieceDetail.tsx** - Comment out 3D viewer
2. **ChessPieceCard.tsx** - Remove 3D view button
3. **collection/[id]/page.tsx** - Remove 3D viewer
4. **chess-piece-management/page.tsx** - Remove 3D preview

## Quick disable method:

Comment out imports and usage of:
- `ChessPiece3DViewer`
- `Model3DViewer`
- `ModelViewer`

