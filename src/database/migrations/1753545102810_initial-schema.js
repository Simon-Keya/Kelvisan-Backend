// This migration is written in plain JavaScript to avoid TypeScript compilation issues
// with node-pg-migrate's type definitions in certain environments.

// Note: The 'pgm' object is provided by node-pg-migrate at runtime.
// @ts-check // You can add this if your editor supports JSDoc type checking

exports.up = async (pgm) => {
    // Enable uuid-ossp extension for UUID generation (PostgreSQL specific)
    await pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  
    // Create 'admins' table
    pgm.createTable('admins', {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
      email: { type: 'text', notNull: true, unique: true },
      password_hash: { type: 'text', notNull: true },
      role: { type: 'text', notNull: true, default: 'user' },
      created_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Create 'login_attempts' table
    pgm.createTable('login_attempts', {
      id: { type: 'SERIAL', primaryKey: true },
      email: { type: 'text', notNull: true },
      success: { type: 'boolean', notNull: true },
      attempted_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Create 'categories' table
    pgm.createTable('categories', {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
      name: { type: 'text', notNull: true, unique: true },
      description: { type: 'text', notNull: false },
      created_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Create 'products' table
    pgm.createTable('products', {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
      name: { type: 'text', notNull: true },
      image_url: { type: 'text', notNull: true },
      description: { type: 'text', notNull: true },
      price: { type: 'NUMERIC(10, 2)', notNull: true },
      category_id: { type: 'uuid', notNull: false }, // Nullable foreign key
      created_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Add foreign key constraint for products to categories
    pgm.addConstraint('products', 'fk_products_category', {
      foreignKeys: {
        columns: 'category_id',
        references: 'categories(id)',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
    });
  
    // Create 'newsletter' table
    pgm.createTable('newsletter', {
      id: { type: 'SERIAL', primaryKey: true },
      email: { type: 'text', notNull: true, unique: true },
      subscribed_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Create 'password_reset_tokens' table
    pgm.createTable('password_reset_tokens', {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
      admin_id: { type: 'uuid', notNull: true },
      token: { type: 'text', notNull: true, unique: true },
      expires_at: { type: 'timestamptz', notNull: true },
      used: { type: 'boolean', notNull: true, default: false },
      created_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: 'timestamptz',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Add foreign key constraint for password_reset_tokens to admins
    pgm.addConstraint('password_reset_tokens', 'fk_password_reset_admin', {
      foreignKeys: {
        columns: 'admin_id',
        references: 'admins(id)',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });
  };
  
  exports.down = async (pgm) => {
    // Drop foreign keys first
    pgm.dropConstraint('password_reset_tokens', 'fk_password_reset_admin');
    pgm.dropConstraint('products', 'fk_products_category');
  
    // Drop tables in reverse order of creation
    pgm.dropTable('password_reset_tokens');
    pgm.dropTable('newsletter');
    pgm.dropTable('products');
    pgm.dropTable('categories');
    pgm.dropTable('login_attempts');
    pgm.dropTable('admins');
  };