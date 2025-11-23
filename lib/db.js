import mysql from 'mysql2/promise';

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'muhmoud_505';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'ecommerce_db';

const tables = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT,
      fullname VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      gender ENUM('male', 'female', 'other') NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    );
  `,
  categories: `
    CREATE TABLE IF NOT EXISTS categories (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    );
  `,
  products: `
    CREATE TABLE IF NOT EXISTS products (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      image_url VARCHAR(2048),
      category_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      INDEX idx_category_id (category_id)
    );
  `,
  orders: `
    CREATE TABLE IF NOT EXISTS orders (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
      shipping_address TEXT NOT NULL,
      order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id)
    );
  `,
  order_items: `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT NOT NULL AUTO_INCREMENT,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `,
  user_addresses: `
    CREATE TABLE IF NOT EXISTS user_addresses (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      country VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      street VARCHAR(255) NOT NULL,
      building_number VARCHAR(50) NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,
  refresh_tokens: `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,
};

let poolPromise;

async function seedDatabase(pool) {
  // Simple slugify function
  const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\u0621-\u064A\u0660-\u0669\-]+/g, '') // Allow Arabic letters, numbers, and hyphens
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text

  // Seed categories
  const categoriesToSeed = ['إلكترونيات', 'حقائب', 'ملابس', 'أحذية', 'إكسسوارات'];
  const [existingCategories] = await pool.query('SELECT name FROM categories');
  const existingCategoryNames = existingCategories.map(c => c.name);

  for (const categoryName of categoriesToSeed) {
    if (!existingCategoryNames.includes(categoryName)) {
      await pool.query('INSERT INTO categories (name) VALUES (?)', [categoryName]);
      console.log(`Seeded category: ${categoryName}`);
    }
  }

  // Seed products
  const [productCount] = await pool.query('SELECT COUNT(*) as count FROM products');
  if (productCount[0].count === 0) {
    console.log('Seeding products...');
    const productsToSeed = [
      { id: 1, name: 'ساعة ذكية أنيقة', price: 899, category: 'إلكترونيات', stock: 10, image_url: '/products/watch.jpg', description: 'اكتشف الساعة الذكية التي تجمع بين التصميم الأنيق والتكنولوجيا المتقدمة.' },
      { id: 2, name: 'حقيبة جلدية فاخرة', price: 299, category: 'حقائب', stock: 5, image_url: '/products/bag.jpg', description: 'حقيبة جلدية فاخرة مصنوعة يدويًا من أجود أنواع الجلود.' },
      { id: 3, name: 'سماعات لاسلكية', price: 199, category: 'إلكترونيات', stock: 0, image_url: '/products/headphones.jpg', description: 'استمتع بتجربة صوتية غامرة مع سماعات لاسلكية عازلة للضوضاء.' }
    ];

    for (const product of productsToSeed) {
      const [[category]] = await pool.query('SELECT id FROM categories WHERE name = ?', [product.category]);
      if (category) {
        const slug = slugify(product.name);
        await pool.query('INSERT INTO products (name, slug, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [product.name, slug, product.description, product.price, product.stock, product.image_url, category.id]);
      }
    }
    console.log('Finished seeding products.');
  }
}

async function initializeDatabase() {
  // Use a single connection to create the database if it doesn't exist.
    const connection = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();

    // Now, create the pool to connect to the database.
    const pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Create tables if they don't exist.
    for (const table of Object.values(tables)) {
      await pool.query(table);
    }

    // Seed the database with initial data if needed
    await seedDatabase(pool);

    console.log('Database and tables initialized successfully.');
    return pool;
}

function getPool() {
  if (!poolPromise) {
    poolPromise = initializeDatabase().catch(err => {
      console.error('Failed to initialize database:', err);
      // Exit the process if the database connection fails, as the app cannot run.
      process.exit(1);
    });
  }
  return poolPromise;
}

export default {
  query: async (...args) => {
    const pool = await getPool();
    return pool.query(...args);
  },
};