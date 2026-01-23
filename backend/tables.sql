CREATE TABLE admins (
    id SERIAL PRIMARY KEY,                 -- auto-increment number

    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),                     -- phone number

    password TEXT NOT NULL,                -- bcrypt hash

    photo_url TEXT,                        -- Cloudinary image URL

    reset_token TEXT,
    reset_token_expires TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Function to set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for admins table
CREATE TRIGGER trigger_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- 2️⃣ Drivers Table (with Cloudinary photo + login/password)
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    photo_url VARCHAR(255),                   -- Cloudinary image URL
    password VARCHAR(255) NOT NULL,      -- Hashed password for login
    reset_token VARCHAR(255),                 -- For password reset
    reset_token_expires TIMESTAMP,            -- Expiration time for reset token
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3️⃣ Bins Table (assigned to drivers & areas)
CREATE TABLE bins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,                 -- Bin label/name
    location VARCHAR(255),                       -- Optional address or description
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL, -- Assigned driver
    capacity INTEGER NOT NULL DEFAULT 100,      -- Max capacity in liters
    current_level INTEGER NOT NULL DEFAULT 0,   -- Current fill level
    status VARCHAR(50) NOT NULL DEFAULT 'empty', -- empty, half-full, full, maintenance
    latitude NUMERIC(10,7),                     -- Optional GPS
    longitude NUMERIC(10,7),
    updated_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE bins
ALTER COLUMN status SET DEFAULT 'working';


-- 4️⃣ Bin Readings Table (for historical/monthly data & trends)
CREATE TABLE bin_readings (
    id SERIAL PRIMARY KEY,
    bin_id INTEGER REFERENCES bins(id) ON DELETE CASCADE,
    fill_level INTEGER NOT NULL,                -- Fill level at reading time
    recorded_at TIMESTAMP DEFAULT NOW()         -- Timestamp of reading
);