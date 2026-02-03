"""Add images fields to products

Revision ID: 004_add_product_images
Revises: 003_add_more_performance_indexes
Create Date: 2025-01-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_add_product_images'
down_revision = '003_add_more_performance_indexes'
branch_labels = None
depends_on = None


def upgrade():
    # Add images and image_url fields to products table
    op.add_column('products', sa.Column('images', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('products', sa.Column('image_url', sa.String(length=500), nullable=True))


def downgrade():
    # Remove images and image_url fields from products table
    op.drop_column('products', 'image_url')
    op.drop_column('products', 'images')

