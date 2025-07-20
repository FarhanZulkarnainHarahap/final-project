import { PrismaClient } from "../generated/prisma/index.js";
import { genSalt, hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.info("🌱 [SEED] Starting seed script");

  try {
    /* -------------------------------------------------------------------------- */
    /*                             DELETE EXISTING DATA                           */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Cleaning old data...");

    await prisma.address.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.productInventory.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.image.deleteMany();
    await prisma.category.deleteMany();

    console.info("✅ Old data cleaned");

    /* -------------------------------------------------------------------------- */
    /*                               CREATE USERS                                  */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating user...");

    const salt = await genSalt(10);
    const hashedPassword = await hash("secret123", salt);

    const user = await prisma.user.create({
      data: {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: hashedPassword,
        isVerified: true,
        username: "johndoe",
        role: "USER",
        Cart: {
          create: {},
        },
      },
    });

    console.info(`✅ User created: ${user.email}`);

    /* -------------------------------------------------------------------------- */
    /*                               CREATE STORE                                  */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating store...");

    const store = await prisma.store.create({
      data: {
        name: "SuperMart",
        userId: user.id,
        address: "123 Main Street",
        city: "Jakarta",
        province: "DKI Jakarta",
        postalCode: "12345",
      },
    });

    console.info(`✅ Store created: ${store.name}`);

    /* -------------------------------------------------------------------------- */
    /*                               CREATE CATEGORY                               */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating categories...");

    const categoryData = [
      { name: "Groceries", description: "Daily needs" },
      { name: "Beverages", description: "Drinks and juices" },
      { name: "Snacks", description: "Packaged snacks" },
    ];

    const categories = await Promise.all(
      categoryData.map((data) => prisma.category.create({ data }))
    );

    console.info(`✅ ${categories.length} categories created`);

    /* -------------------------------------------------------------------------- */
    /*                               CREATE IMAGES                                 */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating images...");

    const imageUrls = [
      "https://images.unsplash.com/photo-1598511720172-31c00b2e8b09?q=80",
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80",
      "https://images.unsplash.com/photo-1606788075761-1a465d96d6b2?q=80",
    ];

    const images = await Promise.all(
      imageUrls.map((url) => prisma.image.create({ data: { imageUrl: url } }))
    );

    console.info(`✅ ${images.length} images created`);

    /* -------------------------------------------------------------------------- */
    /*                               CREATE PRODUCTS                               */
    /* -------------------------------------------------------------------------- */
    console.info("⚡ Creating products...");

    const productsData = [
      {
        name: "Apple Fuji",
        description: "Fresh Fuji apples from the farm.",
        stock: 100,
        price: 30000,
        weight: 0.2,
        storeId: store.id,
        userId: "1",
        categoryIds: [categories[0].id],
        imageIds: [images[0].id],
      },
      {
        name: "Orange Juice",
        description: "100% pure orange juice, no sugar added.",
        stock: 0,
        price: 25000,
        weight: 1,
        storeId: store.id,
        userId: "1",
        categoryIds: [categories[1].id],
        imageIds: [images[1].id],
      },
      {
        name: "Potato Chips",
        description: "Crispy salted potato chips.",
        stock: 50,
        price: 15000,
        weight: 0.1,
        storeId: store.id,
        userId: "1",
        categoryIds: [categories[2].id],
        imageIds: [images[2].id],
      },
    ];

    for (const product of productsData) {
      try {
        const createdProduct = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            stock: product.stock,
            price: product.price,
            weight: product.weight,
            storeId: product.storeId,
            userId: product.userId,
            ProductCategory: {
              create: product.categoryIds.map((categoryId) => ({ categoryId })),
            },
            ProductImage: {
              create: product.imageIds.map((imageId) => ({ imageId })),
            },
          },
        });

        // Create ProductInventory for store
        await prisma.productInventory.create({
          data: {
            userId: product.userId,
            productId: createdProduct.id,
            storeId: store.id,
            stock: product.stock,
          },
        });

        console.info(`✅ Product created: ${createdProduct.name}`);
      } catch (productError) {
        console.error(
          `❌ Error creating product ${product.name}:`,
          productError
        );
      }
    }

    console.info("🌱 Seed completed successfully ✅");
  } catch (error) {
    console.error("❌ Error during seed:", error);
  } finally {
    await prisma.$disconnect();
    console.info("🔌 Prisma client disconnected");
  }
}

main();
