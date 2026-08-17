-- CreateEnum
CREATE TYPE "Role" AS ENUM ('farmer', 'dealer', 'machineOwner', 'agency', 'admin');

-- CreateEnum
CREATE TYPE "AgencyVerificationStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "MachineType" AS ENUM ('tractor', 'harvester', 'sprayer');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('whatsapp', 'web');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ta', 'en');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('seed', 'fertilizer', 'organic_fertilizer', 'bio_fertilizer', 'nutrient', 'plant_protection', 'tool', 'irrigation', 'sprayer', 'other');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "village" TEXT,
    "district" TEXT,
    "land_size" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "business_description" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "gst_number" TEXT,
    "license_number" TEXT,
    "logo_url" TEXT,
    "verification_status" "AgencyVerificationStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmer_crops" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "crop_name" TEXT NOT NULL,

    CONSTRAINT "farmer_crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crop_prices" (
    "id" TEXT NOT NULL,
    "crop_name" TEXT NOT NULL,
    "market" TEXT,
    "district" TEXT NOT NULL,
    "modal_price" DOUBLE PRECISION NOT NULL,
    "price_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crop_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "machine_type" "MachineType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_per_day" DOUBLE PRECISION NOT NULL,
    "district" TEXT NOT NULL,
    "location" TEXT,
    "photo_url" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_unavailable_dates" (
    "id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_unavailable_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_bookings" (
    "id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "farmer_phone" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "machine_type" "MachineType" NOT NULL,
    "requested_date" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "machine_owner_id" TEXT NOT NULL,
    "admin_note" TEXT,
    "source" "Source" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_sessions" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "user_id" TEXT,
    "language" "Language" NOT NULL DEFAULT 'ta',
    "current_flow" TEXT NOT NULL,
    "context" JSONB NOT NULL DEFAULT '{}',
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_message_logs" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "message_type" TEXT NOT NULL,
    "content" TEXT,
    "media_id" TEXT,
    "wa_message_id" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disease_detections" (
    "id" TEXT NOT NULL,
    "farmer_id" TEXT,
    "phone_number" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "crop" TEXT NOT NULL,
    "recommendation_en" TEXT,
    "recommendation_ta" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disease_detections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ProductCategory" NOT NULL,
    "crop_name" TEXT,
    "brand" TEXT,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "image_url" TEXT,
    "district" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_orders" (
    "id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "delivery_address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "source" "Source" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "product_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_district_idx" ON "users"("district");

-- CreateIndex
CREATE UNIQUE INDEX "agency_profiles_user_id_key" ON "agency_profiles"("user_id");

-- CreateIndex
CREATE INDEX "crop_prices_crop_name_idx" ON "crop_prices"("crop_name");

-- CreateIndex
CREATE INDEX "crop_prices_district_idx" ON "crop_prices"("district");

-- CreateIndex
CREATE INDEX "crop_prices_market_idx" ON "crop_prices"("market");

-- CreateIndex
CREATE INDEX "crop_prices_price_date_idx" ON "crop_prices"("price_date");

-- CreateIndex
CREATE INDEX "machines_machine_type_idx" ON "machines"("machine_type");

-- CreateIndex
CREATE INDEX "machines_district_idx" ON "machines"("district");

-- CreateIndex
CREATE INDEX "machine_bookings_status_idx" ON "machine_bookings"("status");

-- CreateIndex
CREATE INDEX "machine_bookings_requested_date_idx" ON "machine_bookings"("requested_date");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_sessions_phone_number_key" ON "whatsapp_sessions"("phone_number");

-- CreateIndex
CREATE INDEX "whatsapp_sessions_phone_number_idx" ON "whatsapp_sessions"("phone_number");

-- CreateIndex
CREATE INDEX "whatsapp_message_logs_phone_number_idx" ON "whatsapp_message_logs"("phone_number");

-- CreateIndex
CREATE INDEX "disease_detections_phone_number_idx" ON "disease_detections"("phone_number");

-- CreateIndex
CREATE INDEX "disease_detections_created_at_idx" ON "disease_detections"("created_at");

-- CreateIndex
CREATE INDEX "products_agency_id_idx" ON "products"("agency_id");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_crop_name_idx" ON "products"("crop_name");

-- CreateIndex
CREATE INDEX "products_district_idx" ON "products"("district");

-- CreateIndex
CREATE INDEX "products_is_available_idx" ON "products"("is_available");

-- CreateIndex
CREATE UNIQUE INDEX "carts_farmer_id_key" ON "carts"("farmer_id");

-- CreateIndex
CREATE INDEX "product_orders_farmer_id_idx" ON "product_orders"("farmer_id");

-- CreateIndex
CREATE INDEX "product_orders_status_idx" ON "product_orders"("status");

-- CreateIndex
CREATE INDEX "product_orders_created_at_idx" ON "product_orders"("created_at");

-- CreateIndex
CREATE INDEX "product_order_items_order_id_idx" ON "product_order_items"("order_id");

-- CreateIndex
CREATE INDEX "product_order_items_product_id_idx" ON "product_order_items"("product_id");

-- CreateIndex
CREATE INDEX "product_order_items_agency_id_idx" ON "product_order_items"("agency_id");

-- AddForeignKey
ALTER TABLE "agency_profiles" ADD CONSTRAINT "agency_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_crops" ADD CONSTRAINT "farmer_crops_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_unavailable_dates" ADD CONSTRAINT "machine_unavailable_dates_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_bookings" ADD CONSTRAINT "machine_bookings_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_bookings" ADD CONSTRAINT "machine_bookings_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_bookings" ADD CONSTRAINT "machine_bookings_machine_owner_id_fkey" FOREIGN KEY ("machine_owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "whatsapp_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disease_detections" ADD CONSTRAINT "disease_detections_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_orders" ADD CONSTRAINT "product_orders_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_order_items" ADD CONSTRAINT "product_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "product_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_order_items" ADD CONSTRAINT "product_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
