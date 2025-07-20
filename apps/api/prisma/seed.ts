// import { url } from "inspector";
// import { PrismaClient } from "../generated/prisma/index.js";
// import { genSalt, hash } from "bcryptjs";

// const prisma = new PrismaClient();

// async function seed() {
//   console.info("🌱 [SEED] Starting seed script");

//   try {
//     /* -------------------------------------------------------------------------- */
//     /*                             DELETE EXISTING DATA                           */
//     /* -------------------------------------------------------------------------- */
//     console.info("⚡ Cleaning old data...");

//     await prisma.orderItem.deleteMany();
//     await prisma.order.deleteMany();
//     await prisma.cartItem.deleteMany();
//     await prisma.cart.deleteMany();
//     await prisma.image.deleteMany();
//     await prisma.productCategory.deleteMany();
//     await prisma.discountUsage.deleteMany();
//     await prisma.discount.deleteMany();
//     await prisma.inventoryJournal.deleteMany();
//     await prisma.storeProduct.deleteMany();
//     await prisma.storeAddress.deleteMany();
//     await prisma.store.deleteMany();
//     await prisma.category.deleteMany();
//     await prisma.product.deleteMany();
//     await prisma.userAddress.deleteMany();
//     await prisma.address.deleteMany();
//     await prisma.user.deleteMany();

//     console.info("✅ Old data cleaned");

//     /* -------------------------------------------------------------------------- */
//     /*                               CREATE USERS                                  */
//     /* -------------------------------------------------------------------------- */
//     // console.info("⚡ Creating users...");

//     // const salt = await genSalt(10);

//     // const user1 = await prisma.user.create({
//     //   data: {
//     //     id: "2",
//     //     firstName: "John",
//     //     lastName: "Doe",
//     //     email: "john@example.com",
//     //     password: await hash("secret123", salt),
//     //     isVerified: true,
//     //     username: "johndoe",
//     //     role: "USER",
//     //     Cart: {
//     //       create: {},
//     //     },
//     //   },
//     // });

//     // const storeAdmin = await prisma.user.create({
//     //   data: {
//     //     id: "1",
//     //     firstName: "Alice",
//     //     lastName: "Smith",
//     //     email: "alice@store.com",
//     //     password: await hash("admin123", salt),
//     //     isVerified: true,
//     //     username: "alicestore",
//     //     role: "STORE_ADMIN",
//     //     Cart: {
//     //       create: {},
//     //     },
//     //   },
//     // });

//     // const superAdmin = await prisma.user.create({
//     //   data: {
//     //     id: "3",
//     //     firstName: "Bob",
//     //     lastName: "Taylor",
//     //     email: "bob@admin.com",
//     //     password: await hash("superadmin123", salt),
//     //     isVerified: true,
//     //     username: "bobsuper",
//     //     role: "SUPER_ADMIN",
//     //     Cart: {
//     //       create: {},
//     //     },
//     //   },
//     // });

//     // console.info("✅ Users created:");
//     // console.info(`- ${user1.email} (USER)`);
//     // console.info(`- ${storeAdmin.email} (STORE_ADMIN)`);
//     // console.info(`- ${superAdmin.email} (SUPER_ADMIN)`);

//     // /* -------------------------------------------------------------------------- */
//     // /*                               CREATE STORE                                  */
//     // /* -------------------------------------------------------------------------- */
//     // // console.info("⚡ Creating store...");

//     // // const store = await prisma.store.create({
//     // //   data: {
//     // //     name: "SuperMart Jakarta",
//     // //     userId: superAdmin.id, // Super Admin creates the store
//     // //     imageUrl:
//     // //       "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1752207909/kota1_mr0e9e.jpg",
//     // //     address: "Jl.Setiabudi No.17",
//     // //     city: "Jakarta",
//     // //     province: "Central Province",
//     // //     postalCode: "12345",
//     // //     latitude: -6.9176,
//     // //     longitude: 107.6191,
//     // //   },
//     // // });

//     // // const store2 = await prisma.store.create({
//     // //   data: {
//     // //     name: "SuperMart Bandung",
//     // //     userId: superAdmin.id, // Super Admin creates the store
//     // //     address: "Jl. Asia Afrika No.2",
//     // //     city: "Bandung",
//     // //     province: "East Province",
//     // //     postalCode: "67890",
//     // //     latitude: -6.193125,
//     // //     longitude: 106.82181,
//     // //   },
//     // // });

//     // // console.info(`✅ Store created: ${store.name}`);

//     // /* -------------------------------------------------------------------------- */
//     // /*                               CREATE CATEGORY                               */
//     // /* -------------------------------------------------------------------------- */
//     // console.info("⚡ Creating categories...");

//     // const categoriesData = [
//     //   { name: "Fruits", description: "Fresh fruits and farm produce." },
//     //   { name: "Beverages", description: "Juices, water, and drinks." },
//     //   {
//     //     name: "Snacks",
//     //     description: "Chips, instant noodles, and ready-to-eat snacks.",
//     //   },
//     //   { name: "Bakery", description: "Breads and baked goods." },
//     //   {
//     //     name: "Eggs & Dairy",
//     //     description: "Milk, eggs, and other dairy products.",
//     //   },
//     //   { name: "Cheese", description: "High quality cheese products." },
//     // ];

//     // for (const category of categoriesData) {
//     //   await prisma.category.create({
//     //     data: {
//     //       description: category.description,
//     //       name: category.name,
//     //     },
//     //   });
//     // }

//     // console.log("Category seeding finished.");

//     // /* -------------------------------------------------------------------------- */
//     // /*                               CREATE ADDRESSES                             */
//     // // /* -------------------------------------------------------------------------- */
//     // // console.info("⚡ Creating addresses...");

//     // // await prisma.address.createMany({
//     // //   data: [
//     // //     {
//     // //       // John Doe
//     // //       street: "456 Elm Street",
//     // //       city: "Jakarta",
//     // //       state: "DKI Jakarta",
//     // //       postalCode: "10120",
//     // //       country: "Indonesia",
//     // //       userId: user1.id,
//     // //     },
//     // //     {
//     // //       // Alice Smith (store admin)
//     // //       street: "789 Pine Road",
//     // //       city: "Bandung",
//     // //       state: "West Java",
//     // //       postalCode: "40181",
//     // //       country: "Indonesia",
//     // //       userId: storeAdmin.id,
//     // //     },
//     // //     {
//     // //       // Bob Taylor (super admin)
//     // //       street: "123 Orchard Lane",
//     // //       city: "Surabaya",
//     // //       state: "East Java",
//     // //       postalCode: "60241",
//     // //       country: "Indonesia",
//     // //       userId: superAdmin.id,
//     // //     },
//     // //   ],
//     // // });

//     // // console.info("✅ 3 addresses created");

//     // /* -------------------------------------------------------------------------- */
//     // /*                               CREATE PRODUCTS                               */
//     // /* -------------------------------------------------------------------------- */
//     // console.info("⚡ Creating products...");
//     // const productsData = [
//     //   {
//     //     name: "Apple Fuji 1 Kg",
//     //     description: "Fresh Fuji apples from the farm.",
//     //     price: 30000,
//     //     weight: 0.2,
//     //     userId: "1",
//     //     imagePreview: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859664/apple_yrplns.jpg",
//     //       },
//     //     ],
//     //     imageContent: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859664/apel_hqtnge.jpg",
//     //       },
//     //     ],
//     //   },
//     //   {
//     //     name: "Orange Juice",
//     //     description: "100% pure orange juice, no sugar added.",
//     //     price: 25000,
//     //     weight: 1,
//     //     userId: "1",
//     //     imagePreview: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751860741/orange_juice_zvtzor.jpg",
//     //       },
//     //     ],
//     //     imageContent: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859790/orange_juice2_txetmj.jpg",
//     //       },
//     //     ],
//     //   },
//     //   {
//     //     name: "Potato Chips",
//     //     description: "Crispy salted potato chips.",
//     //     price: 15000,
//     //     weight: 0.1,
//     //     userId: "1",
//     //     imagePreview: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/chips_uhv1b8.jpg",
//     //       },
//     //     ],
//     //     imageContent: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/chips2_mxjhhv.jpg",
//     //       },
//     //     ],
//     //   },
//     //   {
//     //     name: "Banana Cavendish",
//     //     description: "Sweet Cavendish bananas, ripe and ready to eat.",
//     //     price: 20000,
//     //     weight: 1,
//     //     userId: "1",
//     //     imagePreview: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/banana2_apja59.jpg",
//     //       },
//     //     ],
//     //     imageContent: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859926/banana_eetanm.jpg",
//     //       },
//     //     ],
//     //   },
//     //   {
//     //     name: "Milk 1L",
//     //     description: "Fresh cow milk in 1 liter bottle.",
//     //     price: 18000,
//     //     weight: 1,
//     //     userId: "1",
//     //     imagePreview: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/milk_r8mmer.jpg",
//     //       },
//     //     ],
//     //     imageContent: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/milk_r8mmer.jpg",
//     //       },
//     //     ],
//     //   },
//     //   {
//     //     name: "Brown Eggs 10pcs",
//     //     description: "Organic brown eggs, pack of 10.",
//     //     price: 22000,
//     //     weight: 0.5,
//     //     userId: "1",
//     //     imagePreview: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/egg_iwbzpp.jpg",
//     //       },
//     //     ],
//     //     imageContent: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/egg_iwbzpp.jpg",
//     //       },
//     //     ],
//     //   },
//     //   {
//     //     name: "Instant Noodles",
//     //     description: "Spicy chicken flavored instant noodles.",
//     //     price: 3500,
//     //     weight: 0.08,
//     //     userId: "1",
//     //     imagePreview: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861875/noodle_rftnje.jpg",
//     //       },
//     //     ],
//     //     imageContent: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861875/noodle_rftnje.jpg",
//     //       },
//     //     ],
//     //   },
//     //   {
//     //     name: "Cheddar Cheese 200g",
//     //     description: "Premium quality cheddar cheese block.",
//     //     price: 45000,
//     //     weight: 0.2,
//     //     userId: "1",
//     //     imagePreview: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751867365/cheese23_pzp0hm.jpg",
//     //       },
//     //     ],
//     //     imageContent: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751867365/cheese23_pzp0hm.jpg",
//     //       },
//     //     ],
//     //   },
//     //   {
//     //     name: "Whole Wheat Bread",
//     //     description: "Soft and healthy whole wheat bread loaf.",
//     //     price: 25000,
//     //     weight: 0.5,
//     //     userId: "1",
//     //     imagePreview: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751862028/bread2_oypqal.jpg",
//     //       },
//     //     ],
//     //     imageContent: [
//     //       {
//     //         url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751862028/bread2_oypqal.jpg",
//     //       },
//     //     ],
//     //   },
//     //   {
//     //     name: "Mineral Water 600ml",
//     //     description: "Clean and fresh bottled mineral water.",
//     //     price: 4000,
//     //     weight: 0.6,
//     //     userId: "1",
//     //   },
//     // ];
//     /* -------------------------------------------------------------------------- */
//     /*                               CREATE ADDRESSES                             */
//     /* -------------------------------------------------------------------------- */
//     console.info("⚡ Creating addresses...");

//     await prisma.address.createMany({
//       data: [
//         {
//           // John Doe
//           street: "456 Elm Street",
//           city: "Jakarta",
//           state: "DKI Jakarta",
//           postalCode: "10120",
//           country: "Indonesia",
//           userId: user1.id,
//         },
//         {
//           // Alice Smith (store admin)
//           street: "789 Pine Road",
//           city: "Bandung",
//           state: "West Java",
//           postalCode: "40181",
//           country: "Indonesia",
//           userId: storeAdmin.id,
//         },
//         {
//           // Bob Taylor (super admin)
//           street: "123 Orchard Lane",
//           city: "Surabaya",
//           state: "East Java",
//           postalCode: "60241",
//           country: "Indonesia",
//           userId: superAdmin.id,
//         },
//       ],
//     });

//     console.info("✅ 3 addresses created");

//     /* -------------------------------------------------------------------------- */
//     /*                               CREATE PRODUCTS                               */
//     /* -------------------------------------------------------------------------- */
//     console.info("⚡ Creating products...");
//     const productsData = [
//       {
//         name: "Apple Fuji",
//         description: "Fresh Fuji apples from the farm.",
//         stock: 100,
//         price: 30000,
//         weight: 0.2,
//         storeId: store.id,
//         userId: "1",
//         imagePreview: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859664/apple_yrplns.jpg",
//           },
//         ],
//         imageContent: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859664/apel_hqtnge.jpg",
//           },
//         ],
//       },
//       {
//         name: "Orange Juice",
//         description: "100% pure orange juice, no sugar added.",
//         stock: 0,
//         price: 25000,
//         weight: 1,
//         storeId: store.id,
//         userId: "1",
//         imagePreview: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751860741/orange_juice_zvtzor.jpg",
//           },
//         ],
//         imageContent: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859790/orange_juice2_txetmj.jpg",
//           },
//         ],
//       },
//       {
//         name: "Potato Chips",
//         description: "Crispy salted potato chips.",
//         stock: 50,
//         price: 15000,
//         weight: 0.1,
//         storeId: store.id,
//         userId: "1",
//         imagePreview: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/chips_uhv1b8.jpg",
//           },
//         ],
//         imageContent: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/chips2_mxjhhv.jpg",
//           },
//         ],
//       },
//       {
//         name: "Banana Cavendish",
//         description: "Sweet Cavendish bananas, ripe and ready to eat.",
//         stock: 120,
//         price: 20000,
//         weight: 1,
//         storeId: store.id,
//         userId: "1",
//         imagePreview: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859927/banana2_apja59.jpg",
//           },
//         ],
//         imageContent: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751859926/banana_eetanm.jpg",
//           },
//         ],
//       },
//       {
//         name: "Milk 1L",
//         description: "Fresh cow milk in 1 liter bottle.",
//         stock: 40,
//         price: 18000,
//         weight: 1,
//         storeId: store.id,
//         userId: "1",
//         imagePreview: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/milk_r8mmer.jpg",
//           },
//         ],
//         imageContent: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/milk_r8mmer.jpg",
//           },
//         ],
//       },
//       {
//         name: "Brown Eggs 10pcs",
//         description: "Organic brown eggs, pack of 10.",
//         stock: 80,
//         price: 22000,
//         weight: 0.5,
//         storeId: store.id,
//         userId: "1",
//         imagePreview: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/egg_iwbzpp.jpg",
//           },
//         ],
//         imageContent: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861611/egg_iwbzpp.jpg",
//           },
//         ],
//       },
//       {
//         name: "Instant Noodles",
//         description: "Spicy chicken flavored instant noodles.",
//         stock: 300,
//         price: 3500,
//         weight: 0.08,
//         storeId: store.id,
//         userId: "1",
//         imagePreview: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861875/noodle_rftnje.jpg",
//           },
//         ],
//         imageContent: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751861875/noodle_rftnje.jpg",
//           },
//         ],
//       },
//       {
//         name: "Cheddar Cheese 200g",
//         description: "Premium quality cheddar cheese block.",
//         stock: 30,
//         price: 45000,
//         weight: 0.2,
//         storeId: store.id,
//         userId: "1",
//         imagePreview: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751867365/cheese23_pzp0hm.jpg",
//           },
//         ],
//         imageContent: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751867365/cheese23_pzp0hm.jpg",
//           },
//         ],
//       },
//       {
//         name: "Whole Wheat Bread",
//         description: "Soft and healthy whole wheat bread loaf.",
//         stock: 60,
//         price: 25000,
//         weight: 0.5,
//         storeId: store.id,
//         userId: "1",
//         imagePreview: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751862028/bread2_oypqal.jpg",
//           },
//         ],
//         imageContent: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751862028/bread2_oypqal.jpg",
//           },
//         ],
//       },
//       {
//         name: "Mineral Water 600ml",
//         description: "Clean and fresh bottled mineral water.",
//         stock: 500,
//         price: 4000,
//         weight: 0.6,
//         storeId: store.id,
//         userId: "1",
//       },
//       {
//         name: "Cheddar Cheese 200g",
//         description: "Premium quality cheddar cheese block.",
//         stock: 30,
//         price: 45000,
//         weight: 0.2,
//         storeId: store.id,
//         userId: "1",
//         imagePreview: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751614925/water_wgkyiy.jpg",
//           },
//         ],
//         imageContent: [
//           {
//             url: "https://res.cloudinary.com/dwu9rmlyv/image/upload/v1751615147/water_content_p6ouan.jpg",
//           },
//         ],
//       },
//     ];

//     // for (const product of productsData) {
//     //   try {
//     //     const createdProduct = await prisma.product.create({
//     //       data: {
//     //         name: product.name,
//     //         description: product.description,
//     //         price: product.price,
//     //         weight: product.weight,
//     //         userId: product.userId,
//     //         imagePreview: {
//     //           create: product.imagePreview?.map((img) => ({
//     //             imageUrl: img.url,
//     //           })),
//     //         },
//     //         imageContent: {
//     //           create: product.imageContent?.map((img) => ({
//     //             imageUrl: img.url,
//     //           })),
//     //         },
//     //       },
//     //     });

//     //     console.info(`✅ Product created: ${createdProduct.name}`);
//     //   } catch (productError) {
//     //     console.error(
//     //       `❌ Error creating product ${product.name}:`,
//     //       productError
//     //     );
//     //   }
//     // }

//     // console.info("🌱 Seed completed successfully ✅");
//     // /* -------------------------------------------------------------------------- */
//     // /*                           CREATE STORE PRODUCT                             */
//     // /* -------------------------------------------------------------------------- */
//     // console.info("⚡ Creating store products...");

//     // try {
//     //   // Ambil semua products dan stores dari DB
//     //   const allProducts = await prisma.product.findMany();
//     //   const allStores = await prisma.store.findMany();

//     //   const storeProductData: {
//     //     storeId: string;
//     //     productId: string;
//     //     stock: number;
//     //   }[] = [];

//     //   for (const store of allStores) {
//     //     for (const product of allProducts) {
//     //       storeProductData.push({
//     //         storeId: store.id,
//     //         productId: product.id,
//     //         stock: Math.floor(Math.random() * 50) + 10,
//     //       });
//     //     }
//     //   }

//     //   if (storeProductData.length > 0) {
//     //     await prisma.storeProduct.createMany({
//     //       data: storeProductData,
//     //       skipDuplicates: true,
//     //     });
//     //   }

//     //   console.info("✅ Store products created");

//     //   console.info("⚡ Creating product-category links...");

//     //   try {
//     //     const allProducts = await prisma.product.findMany();
//     //     const allCategories = await prisma.category.findMany();

//     //     const productMap = new Map(allProducts.map((p) => [p.name, p.id]));
//     //     const categoryMap = new Map(allCategories.map((c) => [c.name, c.id]));

//     //     const productCategoryMapping = [
//     //       { productName: "Apple Fuji 1 Kg", categoryName: "Fruits" },
//     //       { productName: "Banana Cavendish", categoryName: "Fruits" },
//     //       { productName: "Orange Juice", categoryName: "Beverages" },
//     //       { productName: "Potato Chips", categoryName: "Snacks" },
//     //       { productName: "Whole Wheat Bread", categoryName: "Bakery" },
//     //       { productName: "Brown Eggs 10pcs", categoryName: "Eggs & Dairy" },
//     //       { productName: "Milk 1L", categoryName: "Eggs & Dairy" },
//     //       { productName: "Instant Noodles", categoryName: "Snacks" },
//     //       { productName: "Cheddar Cheese 200g", categoryName: "Cheese" },
//     //       { productName: "Mineral Water 600ml", categoryName: "Beverages" },
//     //     ];

//     //     const productCategoryData: { productId: string; categoryId: string }[] =
//     //       [];

//     //     for (const mapping of productCategoryMapping) {
//     //       const productId = productMap.get(mapping.productName);
//     //       const categoryId = categoryMap.get(mapping.categoryName);
//     //       if (productId && categoryId) {
//     //         productCategoryData.push({
//     //           productId,
//     //           categoryId,
//     //         });
//     //       }
//     //     }

//     //     if (productCategoryData.length > 0) {
//     //       await prisma.productCategory.createMany({
//     //         data: productCategoryData,
//     //         skipDuplicates: true,
//     //       });
//     //     }

//     //     console.info("✅ Product-category links created");
//     //   } catch (error) {
//     //     console.error("❌ Error creating product-category links:", error);
//     //   }
//     // } catch (error) {
//     //   console.error("❌ Error creating store products:", error);
//     // }
//   } catch (error) {
//     console.error("❌ Error during seed:", error);
//   } finally {
//     await prisma.$disconnect();
//     console.info("🔌 Prisma client disconnected");
//   }
// }

// seed();
