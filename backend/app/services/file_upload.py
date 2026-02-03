"""
File Upload Service
Handles file uploads for images, documents, etc.
"""
import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import boto3
from botocore.exceptions import ClientError

from app.core.config import settings


class FileUploadService:
    """Service for handling file uploads"""
    
    # Allowed image extensions
    ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    
    # Allowed document extensions
    ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt', '.html'}
    
    # Max file size (10MB)
    MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE
    
    @staticmethod
    def _get_file_extension(filename: str) -> str:
        """Get file extension from filename"""
        return Path(filename).suffix.lower()
    
    @staticmethod
    def _generate_unique_filename(original_filename: str, prefix: str = "") -> str:
        """Generate unique filename"""
        ext = FileUploadService._get_file_extension(original_filename)
        unique_id = str(uuid.uuid4())
        if prefix:
            return f"{prefix}_{unique_id}{ext}"
        return f"{unique_id}{ext}"
    
    @staticmethod
    def _validate_file_size(file: UploadFile) -> None:
        """Validate file size"""
        # Read file to check size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > FileUploadService.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Arquivo muito grande. Tamanho máximo: {FileUploadService.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
    
    @staticmethod
    def _validate_image(file: UploadFile) -> None:
        """Validate image file"""
        ext = FileUploadService._get_file_extension(file.filename)
        if ext not in FileUploadService.ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Formato de imagem não permitido. Formatos permitidos: {', '.join(FileUploadService.ALLOWED_IMAGE_EXTENSIONS)}"
            )
        
        # Try to open as image to validate
        try:
            file.file.seek(0)
            img = Image.open(file.file)
            img.verify()
            file.file.seek(0)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Arquivo não é uma imagem válida"
            )
    
    @staticmethod
    def _validate_document(file: UploadFile) -> None:
        """Validate document file"""
        ext = FileUploadService._get_file_extension(file.filename)
        if ext not in FileUploadService.ALLOWED_DOCUMENT_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Formato de documento não permitido. Formatos permitidos: {', '.join(FileUploadService.ALLOWED_DOCUMENT_EXTENSIONS)}"
            )
    
    @staticmethod
    def _optimize_image(file: UploadFile, max_width: int = 1920, max_height: int = 1080, quality: int = 85) -> bytes:
        """Optimize image (resize and compress)"""
        file.file.seek(0)
        img = Image.open(file.file)
        
        # Convert RGBA to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Resize if necessary
        if img.width > max_width or img.height > max_height:
            img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        
        # Save optimized image
        from io import BytesIO
        output = BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        output.seek(0)
        return output.read()
    
    @staticmethod
    async def upload_to_local(
        file: UploadFile,
        folder: str = "uploads",
        prefix: str = "",
        optimize_image: bool = True
    ) -> dict:
        """
        Upload file to local storage
        
        Returns:
            dict with 'filename', 'url', 'size', 'content_type'
        """
        # Validate file size
        FileUploadService._validate_file_size(file)
        
        # Determine file type and validate
        ext = FileUploadService._get_file_extension(file.filename)
        is_image = ext in FileUploadService.ALLOWED_IMAGE_EXTENSIONS
        is_document = ext in FileUploadService.ALLOWED_DOCUMENT_EXTENSIONS
        
        if not is_image and not is_document:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de arquivo não permitido"
            )
        
        if is_image:
            FileUploadService._validate_image(file)
        else:
            FileUploadService._validate_document(file)
        
        # Generate unique filename
        filename = FileUploadService._generate_unique_filename(file.filename, prefix)
        
        # Create folder if it doesn't exist
        safe_folder = (folder or "uploads").strip().strip("/\\")
        base_upload_dir = Path("uploads")
        upload_dir = base_upload_dir / safe_folder
        upload_dir.mkdir(parents=True, exist_ok=True)

        file_path = upload_dir / filename
        
        # Read file content
        if is_image and optimize_image:
            content = FileUploadService._optimize_image(file)
            file_size = len(content)
            with open(file_path, 'wb') as f:
                f.write(content)
        else:
            content = await file.read()
            file_size = len(content)
            with open(file_path, 'wb') as f:
                f.write(content)
        
        # Generate URL
        url = f"/uploads/{safe_folder}/{filename}"
        
        return {
            "filename": filename,
            "url": url,
            "size": file_size,
            "content_type": file.content_type,
            "original_filename": file.filename
        }
    
    @staticmethod
    async def upload_to_s3(
        file: UploadFile,
        folder: str = "uploads",
        prefix: str = "",
        optimize_image: bool = True
    ) -> dict:
        """
        Upload file to AWS S3
        
        Returns:
            dict with 'filename', 'url', 'size', 'content_type'
        """
        if not settings.S3_BUCKET_NAME:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="S3 não configurado"
            )
        
        # Validate file size
        FileUploadService._validate_file_size(file)
        
        # Determine file type and validate
        ext = FileUploadService._get_file_extension(file.filename)
        is_image = ext in FileUploadService.ALLOWED_IMAGE_EXTENSIONS
        is_document = ext in FileUploadService.ALLOWED_DOCUMENT_EXTENSIONS
        
        if not is_image and not is_document:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de arquivo não permitido"
            )
        
        if is_image:
            FileUploadService._validate_image(file)
        else:
            FileUploadService._validate_document(file)
        
        # Generate unique filename
        filename = FileUploadService._generate_unique_filename(file.filename, prefix)
        s3_key = f"{folder}/{filename}"
        
        # Read file content
        if is_image and optimize_image:
            content = FileUploadService._optimize_image(file)
            content_type = "image/jpeg"
        else:
            content = await file.read()
            content_type = file.content_type
        
        # Upload to S3
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        
        try:
            s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key,
                Body=content,
                ContentType=content_type,
                ACL='public-read'  # Make publicly accessible
            )
            
            # Generate URL
            url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
            
            return {
                "filename": filename,
                "url": url,
                "size": len(content),
                "content_type": content_type,
                "original_filename": file.filename
            }
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao fazer upload para S3: {str(e)}"
            )
    
    @staticmethod
    async def upload_file(
        file: UploadFile,
        folder: str = "uploads",
        prefix: str = "",
        optimize_image: bool = True
    ) -> dict:
        """
        Upload file (automatically chooses local or S3 based on config)
        
        Returns:
            dict with 'filename', 'url', 'size', 'content_type'
        """
        if settings.S3_BUCKET_NAME and settings.AWS_ACCESS_KEY_ID:
            return await FileUploadService.upload_to_s3(
                file, folder, prefix, optimize_image
            )
        else:
            return await FileUploadService.upload_to_local(
                file, folder, prefix, optimize_image
            )
    
    @staticmethod
    def delete_file(filename: str, folder: str = "uploads") -> bool:
        """Delete file from storage"""
        if settings.S3_BUCKET_NAME and settings.AWS_ACCESS_KEY_ID:
            # Delete from S3
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
            try:
                s3_client.delete_object(
                    Bucket=settings.S3_BUCKET_NAME,
                    Key=f"{folder}/{filename}"
                )
                return True
            except ClientError:
                return False
        else:
            # Delete from local
            safe_folder = (folder or "uploads").strip().strip("/\\")
            file_path = Path("uploads") / safe_folder / filename
            if file_path.exists():
                file_path.unlink()
                return True
            return False

