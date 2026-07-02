CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('user', 'admin', 'shopowner', 'shipper') NOT NULL DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    
    -- Thông tin người nhận
    recipient_name VARCHAR(100) NOT NULL, 
    phone VARCHAR(15) NOT NULL,           
    
    -- Chi tiết địa chỉ
    street_address TEXT NOT NULL,         
    ward VARCHAR(50),                     
    district VARCHAR(50),                 
    city VARCHAR(50),                     
    
    -- Trạng thái
    is_default BOOLEAN DEFAULT FALSE,     
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,          
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,          
    category_id INT,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,        
    stock_quantity INT NOT NULL DEFAULT 0, 
    image_url VARCHAR(255),
    origin VARCHAR(100),                 
    unit VARCHAR(20) DEFAULT 'kg',       
    is_available BOOLEAN DEFAULT TRUE,   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE carts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Đã thêm CASCADE: Xóa user hoặc product thì giỏ hàng tự động dọn dẹp
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0, -- Phí ship khách hàng phải trả
    
    -- Thông tin thanh toán mới được bổ sung
    payment_method VARCHAR(50) NOT NULL,  -- VD: 'COD', 'VNPay', 'BankTransfer'
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    
    shipping_address TEXT NOT NULL,
    phone VARCHAR(15) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
    note TEXT,
    -- Không dùng CASCADE ở đây để bảo vệ dữ liệu lịch sử đơn hàng
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,    
    -- Không dùng CASCADE để giữ nguyên chi tiết đơn hàng
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_date DATE NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_products_sold INT DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deliveries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,          
    shipper_id INT NOT NULL,               
    pickup_address TEXT NOT NULL,          
    delivery_address TEXT NOT NULL,        
    shipping_status ENUM('assigned', 'picked_up', 'in_transit', 'delivered', 'failed') DEFAULT 'assigned',
    shipping_fee DECIMAL(10,2) DEFAULT 0,  -- Tiền cước trả cho Shipper
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picked_up_at TIMESTAMP NULL,           
    delivered_at TIMESTAMP NULL,           
    proof_of_delivery_url VARCHAR(255),    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (shipper_id) REFERENCES users(id)
);

CREATE TABLE delivery_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_id INT NOT NULL,
    status_description VARCHAR(255) NOT NULL, 
    current_location VARCHAR(255),            
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE
);