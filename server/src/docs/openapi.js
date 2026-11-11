export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Stride Athletics API",
    version: "1.0.0",
    description:
      "REST API e-commerce Stride Athletics. Semua respons memakai format standar success/message/data/meta.",
  },
  servers: [{ url: "/api", description: "Base path API" }],
  tags: [
    { name: "Health", description: "Status server" },
    { name: "Auth", description: "Registrasi, login, dan profil" },
    { name: "Addresses", description: "Alamat pengiriman user" },
    { name: "Cart", description: "Keranjang user" },
    { name: "Wishlist", description: "Wishlist user" },
    { name: "Products", description: "Katalog produk" },
    { name: "Categories", description: "Kategori olahraga" },
    { name: "Orders", description: "Checkout, pembuatan order, riwayat, dan detail order" },
    { name: "Shipping", description: "Layanan pengiriman (mock development)" },
    { name: "Payments", description: "Midtrans Snap, notifikasi, dan status pembayaran" },
    { name: "Notifications", description: "Notifikasi user" },
    { name: "Help", description: "Pusat bantuan dan artikel" },
    { name: "News", description: "Artikel news dan produk terkait" },
    { name: "Contact", description: "Formulir kontak" },
    { name: "Sitemap", description: "Struktur kategori dan produk" },
    {
      name: "Admin",
      description: "Dashboard operasional khusus role ADMIN",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "stride_token",
      },
    },
    schemas: {
      SuccessEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Berhasil" },
          data: {},
          meta: { nullable: true },
        },
      },
      ErrorEnvelope: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Terjadi kesalahan" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 12 },
          total: { type: "integer", example: 24 },
          totalPages: { type: "integer", example: 2 },
          hasNextPage: { type: "boolean" },
          hasPrevPage: { type: "boolean" },
        },
      },
      ProductImage: {
        type: "object",
        properties: {
          id: { type: "integer" },
          url: { type: "string" },
          alt: { type: "string", nullable: true },
          sortOrder: { type: "integer" },
          isPrimary: { type: "boolean" },
        },
      },
      ProductCard: {
        type: "object",
        properties: {
          id: { type: "integer" },
          sku: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          brand: { type: "string" },
          category: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              slug: { type: "string" },
            },
          },
          gender: { type: "string", enum: ["men", "women", "kids", "unisex"] },
          basePrice: { type: "integer", example: 2799000 },
          salePrice: { type: "integer", nullable: true, example: 2499000 },
          price: { type: "integer", example: 2499000 },
          discountPercent: { type: "integer", example: 11 },
          badge: { type: "string", nullable: true },
          rating: {
            type: "object",
            properties: {
              average: { type: "number" },
              count: { type: "integer" },
            },
          },
          image: { $ref: "#/components/schemas/ProductImage" },
          availableSizes: {
            type: "array",
            items: { type: "string" },
            example: ["EU 40", "EU 41"],
          },
          totalStock: { type: "integer" },
        },
      },
      ProductDetail: {
        allOf: [
          { $ref: "#/components/schemas/ProductCard" },
          {
            type: "object",
            properties: {
              description: { type: "string" },
              images: {
                type: "array",
                items: { $ref: "#/components/schemas/ProductImage" },
              },
              variants: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    sku: { type: "string" },
                    size: { type: "string", example: "EU 42" },
                    color: { type: "string", example: "Hitam" },
                    colorHex: { type: "string", nullable: true },
                    price: { type: "integer" },
                    stock: { type: "integer" },
                    isAvailable: { type: "boolean" },
                  },
                },
              },
              reviews: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    rating: { type: "integer" },
                    title: { type: "string", nullable: true },
                    comment: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    userName: { type: "string" },
                  },
                },
              },
              relatedProducts: {
                type: "array",
                items: { $ref: "#/components/schemas/ProductCard" },
              },
            },
          },
        ],
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string", nullable: true },
          imageUrl: { type: "string", nullable: true },
          productCount: { type: "integer" },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string", nullable: true },
          role: { type: "string", enum: ["USER", "ADMIN"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Address: {
        type: "object",
        properties: {
          id: { type: "integer" },
          label: { type: "string", example: "Rumah" },
          recipientName: { type: "string" },
          phone: { type: "string" },
          province: { type: "string" },
          city: { type: "string" },
          district: { type: "string" },
          postalCode: { type: "string", example: "10310" },
          detail: { type: "string" },
          isDefault: { type: "boolean" },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          productId: { type: "integer" },
          variantId: { type: "integer" },
          slug: { type: "string" },
          name: { type: "string" },
          size: { type: "string", example: "EU 42" },
          color: { type: "string" },
          price: { type: "integer", description: "Harga satuan dari server" },
          image: { $ref: "#/components/schemas/ProductImage" },
          quantity: { type: "integer" },
          stock: { type: "integer" },
        },
      },
      Cart: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/CartItem" },
          },
          itemCount: { type: "integer" },
          subtotal: { type: "integer" },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          productId: { type: "integer" },
          variantId: { type: "integer", nullable: true },
          slug: { type: "string", nullable: true },
          name: { type: "string" },
          sku: { type: "string" },
          size: { type: "string", example: "EU 42" },
          color: { type: "string" },
          unitPrice: { type: "integer" },
          quantity: { type: "integer" },
          lineTotal: { type: "integer" },
          image: { $ref: "#/components/schemas/ProductImage" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer" },
          orderNumber: { type: "string", example: "STR-20261111-A1B2C3" },
          status: {
            type: "string",
            enum: [
              "PENDING_PAYMENT",
              "PAID",
              "PROCESSING",
              "SHIPPED",
              "DELIVERED",
              "CANCELLED",
              "EXPIRED",
              "FAILED",
              "REFUNDED",
            ],
          },
          subtotal: { type: "integer" },
          discountTotal: { type: "integer" },
          shippingCost: { type: "integer" },
          total: { type: "integer" },
          couponCode: { type: "string", nullable: true },
          notes: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          expiresAt: { type: "string", format: "date-time", nullable: true },
          paidAt: { type: "string", format: "date-time", nullable: true },
          cancelledAt: { type: "string", format: "date-time", nullable: true },
          recipient: {
            type: "object",
            properties: {
              name: { type: "string" },
              phone: { type: "string" },
              email: { type: "string", format: "email" },
              province: { type: "string" },
              city: { type: "string" },
              district: { type: "string" },
              postalCode: { type: "string" },
              detail: { type: "string" },
            },
          },
          shipping: {
            type: "object",
            properties: {
              provider: { type: "string", nullable: true },
              service: { type: "string", nullable: true },
            },
          },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItem" },
          },
          payment: {
            type: "object",
            nullable: true,
            properties: {
              provider: { type: "string", enum: ["midtrans", "mock"] },
              status: { type: "string" },
              method: { type: "string", nullable: true },
              grossAmount: { type: "integer" },
              snapToken: { type: "string", nullable: true },
              snapRedirectUrl: { type: "string", nullable: true },
              paidAt: { type: "string", format: "date-time", nullable: true },
              expiresAt: { type: "string", format: "date-time", nullable: true },
            },
          },
          shipment: {
            type: "object",
            nullable: true,
            properties: {
              provider: { type: "string" },
              service: { type: "string" },
              trackingNumber: { type: "string", nullable: true },
              status: { type: "string" },
              cost: { type: "integer" },
              estimatedArrival: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              shippedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              deliveredAt: {
                type: "string",
                format: "date-time",
                nullable: true,
              },
              events: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    description: { type: "string" },
                    source: { type: "string" },
                    occurredAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          statusHistory: {
            type: "array",
            items: {
              type: "object",
              properties: {
                fromStatus: { type: "string", nullable: true },
                toStatus: { type: "string" },
                source: { type: "string" },
                note: { type: "string", nullable: true },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      Payment: {
        type: "object",
        properties: {
          provider: { type: "string", enum: ["midtrans", "mock"] },
          status: {
            type: "string",
            enum: [
              "PENDING",
              "SETTLEMENT",
              "CHALLENGE",
              "DENY",
              "CANCEL",
              "EXPIRE",
              "FAILURE",
              "REFUND",
              "CHARGEBACK",
            ],
          },
          method: { type: "string", nullable: true },
          grossAmount: { type: "integer" },
          snapToken: { type: "string", nullable: true },
          snapRedirectUrl: { type: "string", nullable: true },
          paidAt: { type: "string", format: "date-time", nullable: true },
          expiresAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      PaymentConfig: {
        type: "object",
        properties: {
          mode: { type: "string", enum: ["midtrans", "mock"] },
          clientKey: { type: "string", nullable: true },
          isProduction: { type: "boolean" },
          snapScriptUrl: { type: "string", nullable: true },
        },
      },
      ShippingService: {
        type: "object",
        properties: {
          provider: { type: "string", example: "JNE" },
          service: { type: "string", example: "REG" },
          description: { type: "string" },
          etaMinDays: { type: "integer", example: 2 },
          etaMaxDays: { type: "integer", example: 3 },
          cost: { type: "integer", example: 18000 },
          currency: { type: "string", example: "IDR" },
          isMock: { type: "boolean", example: true },
        },
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "integer" },
          type: { type: "string", enum: ["ORDER", "PROMO", "SYSTEM"] },
          title: { type: "string" },
          body: { type: "string" },
          link: { type: "string", nullable: true },
          isRead: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      HelpArticleSummary: {
        type: "object",
        properties: {
          id: { type: "integer" },
          slug: { type: "string" },
          title: { type: "string" },
          category: { type: "string" },
          excerpt: { type: "string" },
        },
      },
      HelpArticle: {
        allOf: [
          { $ref: "#/components/schemas/HelpArticleSummary" },
          {
            type: "object",
            properties: {
              content: { type: "string" },
              updatedAt: { type: "string", format: "date-time" },
              related: {
                type: "array",
                items: { $ref: "#/components/schemas/HelpArticleSummary" },
              },
            },
          },
        ],
      },
      NewsSummary: {
        type: "object",
        properties: {
          id: { type: "integer" },
          slug: { type: "string" },
          title: { type: "string" },
          excerpt: { type: "string" },
          coverImage: { type: "string", nullable: true },
          category: { type: "string" },
          viewCount: { type: "integer" },
          publishedAt: { type: "string", format: "date-time" },
        },
      },
      NewsArticle: {
        allOf: [
          { $ref: "#/components/schemas/NewsSummary" },
          {
            type: "object",
            properties: {
              content: { type: "string" },
              products: {
                type: "array",
                items: { $ref: "#/components/schemas/ProductCard" },
              },
              related: {
                type: "array",
                items: { $ref: "#/components/schemas/NewsSummary" },
              },
            },
          },
        ],
      },
      ContactMessageInput: {
        type: "object",
        required: ["name", "email", "subject", "message"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 80 },
          email: { type: "string", format: "email" },
          phone: { type: "string", maxLength: 24 },
          subject: { type: "string", minLength: 3, maxLength: 120 },
          message: { type: "string", minLength: 10, maxLength: 2000 },
        },
      },
      Sitemap: {
        type: "object",
        properties: {
          genders: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                label: { type: "string" },
              },
            },
          },
          categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
                slug: { type: "string" },
                productCount: { type: "integer" },
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      name: { type: "string" },
                      slug: { type: "string" },
                      gender: { type: "string" },
                    },
                  },
                },
                groups: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      key: { type: "string" },
                      label: { type: "string" },
                      products: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "integer" },
                            name: { type: "string" },
                            slug: { type: "string" },
                            gender: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      CheckoutPreview: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                cartItemId: { type: "integer" },
                productId: { type: "integer" },
                variantId: { type: "integer" },
                slug: { type: "string" },
                productName: { type: "string" },
                sku: { type: "string" },
                size: { type: "string" },
                color: { type: "string" },
                image: { $ref: "#/components/schemas/ProductImage" },
                unitPrice: { type: "integer" },
                quantity: { type: "integer" },
                stock: { type: "integer" },
              },
            },
          },
          itemCount: { type: "integer" },
          subtotal: { type: "integer" },
          discountTotal: { type: "integer" },
          shippingCost: { type: "integer" },
          total: { type: "integer" },
          shipping: {
            type: "object",
            nullable: true,
            properties: {
              provider: { type: "string" },
              service: { type: "string" },
              description: { type: "string" },
              etaMinDays: { type: "integer" },
              etaMaxDays: { type: "integer" },
              isMock: { type: "boolean" },
            },
          },
          coupon: {
            type: "object",
            nullable: true,
            properties: {
              code: { type: "string" },
              description: { type: "string", nullable: true },
              type: { type: "string", enum: ["PERCENT", "FIXED"] },
              value: { type: "integer" },
              maxDiscount: { type: "integer", nullable: true },
            },
          },
        },
      },
      PaymentStatus: {
        allOf: [
          { $ref: "#/components/schemas/Order" },
          {
            type: "object",
            properties: {
              paymentConfig: { $ref: "#/components/schemas/PaymentConfig" },
            },
          },
        ],
      },
    },
    responses: {
      BadRequest: {
        description: "Permintaan tidak valid",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorEnvelope" },
          },
        },
      },
      NotFound: {
        description: "Data tidak ditemukan",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorEnvelope" },
          },
        },
      },
      Unauthorized: {
        description: "Belum login atau sesi tidak valid",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorEnvelope" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Server berjalan",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessEnvelope" },
              },
            },
          },
        },
      },
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "Daftar produk dengan filter, sorting, dan pagination",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          {
            name: "gender",
            in: "query",
            schema: {
              type: "string",
              enum: ["men", "women", "kids", "unisex"],
            },
          },
          { name: "size", in: "query", schema: { type: "string" } },
          { name: "color", in: "query", schema: { type: "string" } },
          { name: "badge", in: "query", schema: { type: "string" } },
          { name: "minPrice", in: "query", schema: { type: "integer" } },
          { name: "maxPrice", in: "query", schema: { type: "integer" } },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["newest", "price_asc", "price_desc", "rating", "popular"],
              default: "newest",
            },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 48, default: 12 },
          },
        ],
        responses: {
          200: {
            description: "Daftar produk",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/ProductCard" },
                        },
                        meta: { $ref: "#/components/schemas/PaginationMeta" },
                      },
                    },
                  ],
                },
              },
            },
          },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/products/{slug}": {
      get: {
        tags: ["Products"],
        summary: "Detail produk berdasarkan slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Detail produk",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/ProductDetail" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Daftar kategori aktif",
        responses: {
          200: {
            description: "Daftar kategori",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Category" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/categories/{slug}": {
      get: {
        tags: ["Categories"],
        summary: "Detail kategori berdasarkan slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Detail kategori",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Category" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrasi akun baru",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Budi Runner" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "budi@example.com",
                  },
                  password: { type: "string", example: "Rahasia#123" },
                  phone: { type: "string", example: "081200000002" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Akun dibuat, cookie sesi diset",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            user: { $ref: "#/components/schemas/AuthUser" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          409: { $ref: "#/components/responses/BadRequest" },
          422: { $ref: "#/components/responses/BadRequest" },
          429: { description: "Rate limit tercapai" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login dan set cookie httpOnly",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@stride.local",
                  },
                  password: { type: "string", example: "User#12345" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login berhasil",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            user: { $ref: "#/components/schemas/AuthUser" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          429: { description: "Rate limit tercapai" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Hapus cookie sesi",
        responses: {
          200: { description: "Logout berhasil" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Profil user saat ini",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Profil user",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            user: { $ref: "#/components/schemas/AuthUser" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
      patch: {
        tags: ["Auth"],
        summary: "Perbarui nama atau telepon",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Budi Runner" },
                  phone: { type: "string", example: "081200000002" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Profil diperbarui" },
          401: { $ref: "#/components/responses/Unauthorized" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/addresses": {
      get: {
        tags: ["Addresses"],
        summary: "Daftar alamat user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Daftar alamat",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Address" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Addresses"],
        summary: "Tambah alamat",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Address" },
            },
          },
        },
        responses: {
          201: { description: "Alamat ditambahkan" },
          401: { $ref: "#/components/responses/Unauthorized" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/addresses/{id}": {
      patch: {
        tags: ["Addresses"],
        summary: "Perbarui alamat milik user",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Address" },
            },
          },
        },
        responses: {
          200: { description: "Alamat diperbarui" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Addresses"],
        summary: "Hapus alamat milik user",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Alamat dihapus" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/cart": {
      get: {
        tags: ["Cart"],
        summary: "Keranjang user dari database",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Keranjang",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Cart" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Kosongkan keranjang",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Keranjang dikosongkan" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/cart/items": {
      post: {
        tags: ["Cart"],
        summary: "Tambah varian ke keranjang",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["variantId"],
                properties: {
                  variantId: { type: "integer" },
                  quantity: { type: "integer", minimum: 1, maximum: 10 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Item ditambahkan" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { description: "Stok habis" },
        },
      },
    },
    "/cart/items/{id}": {
      patch: {
        tags: ["Cart"],
        summary: "Ubah jumlah item",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                properties: {
                  quantity: { type: "integer", minimum: 1, maximum: 10 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Jumlah diperbarui" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Hapus item",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Item dihapus" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/cart/merge": {
      post: {
        tags: ["Cart"],
        summary: "Gabungkan cart tamu setelah login",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["variantId"],
                      properties: {
                        variantId: { type: "integer" },
                        quantity: { type: "integer", minimum: 1, maximum: 10 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Cart digabung, berisi mergedCount dan rejectedCount",
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/wishlist": {
      get: {
        tags: ["Wishlist"],
        summary: "Wishlist user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Wishlist" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Wishlist"],
        summary: "Tambah produk ke wishlist",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productId"],
                properties: { productId: { type: "integer" } },
              },
            },
          },
        },
        responses: {
          201: { description: "Produk ditambahkan" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/wishlist/{productId}": {
      delete: {
        tags: ["Wishlist"],
        summary: "Hapus produk dari wishlist",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Produk dihapus" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/wishlist/merge": {
      post: {
        tags: ["Wishlist"],
        summary: "Gabungkan wishlist tamu setelah login",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  productIds: {
                    type: "array",
                    items: { type: "integer" },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Wishlist digabung" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/orders/preview": {
      post: {
        tags: ["Orders"],
        summary: "Hitung ringkasan checkout (harga, voucher, ongkir)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  shippingProvider: { type: "string", example: "JNE" },
                  shippingService: { type: "string", example: "REG" },
                  couponCode: { type: "string", example: "STRIDE10" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Ringkasan checkout",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          $ref: "#/components/schemas/CheckoutPreview",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          409: { description: "Stok tidak mencukupi" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "Daftar pesanan milik user",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "q",
            in: "query",
            description: "Pencarian nomor pesanan",
            schema: { type: "string" },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "PENDING_PAYMENT",
                "PAID",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
                "EXPIRED",
                "FAILED",
                "REFUNDED",
              ],
            },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 10 },
          },
        ],
        responses: {
          200: {
            description: "Daftar pesanan dengan pagination",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Order" },
                        },
                        meta: { $ref: "#/components/schemas/PaginationMeta" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Orders"],
        summary: "Buat order dari cart dan reservasi stok",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "addressId",
                  "shippingProvider",
                  "shippingService",
                ],
                properties: {
                  addressId: { type: "integer" },
                  shippingProvider: { type: "string", example: "JNE" },
                  shippingService: { type: "string", example: "REG" },
                  couponCode: { type: "string", example: "STRIDE10" },
                  notes: { type: "string", maxLength: 240 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Order dibuat",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Order" },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { description: "Stok tidak mencukupi" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/orders/{orderNumber}": {
      get: {
        tags: ["Orders"],
        summary: "Detail order milik user",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "orderNumber",
            in: "path",
            required: true,
            schema: { type: "string", example: "STR-20261111-A1B2C3" },
          },
        ],
        responses: {
          200: {
            description: "Detail order",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Order" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/shipping/services": {
      get: {
        tags: ["Shipping"],
        summary: "Daftar layanan pengiriman (mock development)",
        responses: {
          200: {
            description: "Layanan pengiriman",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/ShippingService",
                          },
                        },
                        meta: {
                          type: "object",
                          properties: {
                            isMock: { type: "boolean", example: true },
                            note: { type: "string" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/payments/config": {
      get: {
        tags: ["Payments"],
        summary: "Konfigurasi mode pembayaran aktif",
        responses: {
          200: {
            description: "Konfigurasi pembayaran",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/PaymentConfig" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/payments/midtrans/snap-token": {
      post: {
        tags: ["Payments"],
        summary: "Buat token Snap (mock bila kredensial kosong)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderNumber"],
                properties: {
                  orderNumber: { type: "string", example: "STR-20261111-A1B2C3" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Token pembayaran",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            orderNumber: { type: "string" },
                            mode: {
                              type: "string",
                              enum: ["midtrans", "mock"],
                            },
                            token: { type: "string" },
                            redirectUrl: { type: "string" },
                            config: {
                              $ref: "#/components/schemas/PaymentConfig",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { description: "Order tidak dapat dibayar" },
        },
      },
    },
    "/payments/midtrans/notification": {
      post: {
        tags: ["Payments"],
        summary: "Webhook notifikasi Midtrans (signature SHA512)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "order_id",
                  "status_code",
                  "gross_amount",
                  "signature_key",
                  "transaction_status",
                ],
                properties: {
                  order_id: { type: "string" },
                  status_code: { type: "string" },
                  gross_amount: { type: "string" },
                  signature_key: { type: "string" },
                  transaction_status: { type: "string" },
                  fraud_status: { type: "string", nullable: true },
                  transaction_id: { type: "string", nullable: true },
                  payment_type: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Notifikasi diproses (idempoten)",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            duplicate: { type: "boolean" },
                            orderNumber: { type: "string" },
                            orderStatus: { type: "string" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          403: { description: "Signature tidak valid" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/payments/mock/settle": {
      post: {
        tags: ["Payments"],
        summary: "Simulasi settlement (hanya mode mock development)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderNumber"],
                properties: {
                  orderNumber: { type: "string", example: "STR-20261111-A1B2C3" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Order menjadi PAID",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Order" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { description: "Simulasi hanya tersedia pada mode mock" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { description: "Order tidak dapat dibayar" },
        },
      },
    },
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Daftar notifikasi user",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["ORDER", "PROMO", "SYSTEM"] },
          },
          {
            name: "unread",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
          },
        ],
        responses: {
          200: {
            description: "Daftar notifikasi dan jumlah belum dibaca",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Notification" },
                        },
                        meta: {
                          allOf: [
                            { $ref: "#/components/schemas/PaginationMeta" },
                            {
                              type: "object",
                              properties: {
                                unreadCount: { type: "integer" },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Tandai semua notifikasi sudah dibaca",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Jumlah notifikasi yang diperbarui",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            updated: { type: "integer" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Tandai satu notifikasi sudah dibaca",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Notifikasi diperbarui",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Notification" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/help": {
      get: {
        tags: ["Help"],
        summary: "Daftar artikel bantuan",
        parameters: [
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
          },
        ],
        responses: {
          200: {
            description: "Artikel bantuan",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: {
                            $ref: "#/components/schemas/HelpArticleSummary",
                          },
                        },
                        meta: { $ref: "#/components/schemas/PaginationMeta" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/help/categories": {
      get: {
        tags: ["Help"],
        summary: "Kategori artikel bantuan",
        responses: {
          200: {
            description: "Kategori dan jumlah artikel",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              category: { type: "string" },
                              count: { type: "integer" },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/help/{slug}": {
      get: {
        tags: ["Help"],
        summary: "Detail artikel bantuan",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Detail artikel dan artikel terkait",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/HelpArticle" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/news": {
      get: {
        tags: ["News"],
        summary: "Daftar artikel news",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["newest", "popular"],
              default: "newest",
            },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 24, default: 9 },
          },
        ],
        responses: {
          200: {
            description: "Daftar artikel news",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/NewsSummary" },
                        },
                        meta: { $ref: "#/components/schemas/PaginationMeta" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/news/categories": {
      get: {
        tags: ["News"],
        summary: "Kategori artikel news",
        responses: {
          200: {
            description: "Kategori dan jumlah artikel",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              category: { type: "string" },
                              count: { type: "integer" },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/news/{slug}": {
      get: {
        tags: ["News"],
        summary: "Detail artikel news",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Detail artikel, produk terkait, dan artikel lainnya",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/NewsArticle" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/contact": {
      post: {
        tags: ["Contact"],
        summary: "Kirim pesan kontak",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactMessageInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Pesan tersimpan di database",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "integer" },
                            status: { type: "string", example: "NEW" },
                            createdAt: {
                              type: "string",
                              format: "date-time",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          422: { $ref: "#/components/responses/BadRequest" },
          429: { description: "Terlalu banyak pesan" },
        },
      },
    },
    "/sitemap": {
      get: {
        tags: ["Sitemap"],
        summary: "Struktur kategori, gender, dan produk",
        responses: {
          200: {
            description: "Sitemap dinamis",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Sitemap" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/payments/{orderNumber}/status": {
      get: {
        tags: ["Payments"],
        summary: "Status pembayaran dan order milik user",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "orderNumber",
            in: "path",
            required: true,
            schema: { type: "string", example: "STR-20261111-A1B2C3" },
          },
        ],
        responses: {
          200: {
            description: "Status pembayaran",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessEnvelope" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/PaymentStatus" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Ringkasan dashboard admin",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Statistik pesanan, pendapatan, stok menipis" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { description: "Khusus admin" },
        },
      },
    },
    "/admin/products": {
      get: {
        tags: ["Admin"],
        summary: "Daftar produk termasuk draft dan terhapus",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["all", "published", "draft", "deleted"],
            },
          },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10, maximum: 50 },
          },
        ],
        responses: {
          200: { description: "Daftar produk dengan meta pagination" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { description: "Khusus admin" },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Buat produk",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["sku", "name", "description", "categoryId", "basePrice"],
                properties: {
                  sku: { type: "string" },
                  name: { type: "string" },
                  slug: { type: "string" },
                  description: { type: "string" },
                  brand: { type: "string" },
                  categoryId: { type: "integer" },
                  gender: {
                    type: "string",
                    enum: ["men", "women", "kids", "unisex"],
                  },
                  basePrice: { type: "integer" },
                  salePrice: { type: "integer", nullable: true },
                  badge: { type: "string", nullable: true },
                  isPublished: { type: "boolean" },
                  images: { type: "array", items: { type: "object" } },
                  variants: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Produk dibuat" },
          409: { description: "SKU atau slug sudah digunakan" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/admin/products/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      get: {
        tags: ["Admin"],
        summary: "Detail produk admin",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Produk beserta gambar dan varian" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "Perbarui produk",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Produk diperbarui" },
          409: { description: "SKU atau slug sudah digunakan" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Soft delete produk",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Produk dihapus dari katalog" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/admin/products/{id}/images": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      post: {
        tags: ["Admin"],
        summary: "Tambah gambar produk",
        security: [{ cookieAuth: [] }],
        responses: {
          201: { description: "Gambar ditambahkan" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/admin/products/{id}/images/{imageId}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
        {
          name: "imageId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      patch: {
        tags: ["Admin"],
        summary: "Perbarui gambar produk",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Gambar diperbarui" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Hapus gambar produk",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Gambar dihapus" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/admin/products/{id}/variants": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      post: {
        tags: ["Admin"],
        summary: "Tambah varian produk",
        security: [{ cookieAuth: [] }],
        responses: {
          201: { description: "Varian ditambahkan" },
          409: { description: "Kombinasi ukuran/warna atau SKU sudah ada" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/admin/products/{id}/variants/{variantId}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
        {
          name: "variantId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      patch: {
        tags: ["Admin"],
        summary: "Perbarui varian",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Varian diperbarui" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Nonaktifkan varian",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Varian dinonaktifkan" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/admin/products/{id}/variants/{variantId}/stock": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
        {
          name: "variantId",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      patch: {
        tags: ["Admin"],
        summary: "Perbarui stok varian",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                properties: {
                  quantity: { type: "integer", minimum: 0 },
                  lowStockThreshold: { type: "integer", minimum: 0 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Stok diperbarui" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/admin/categories": {
      get: {
        tags: ["Admin"],
        summary: "Daftar semua kategori",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Daftar kategori" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Buat kategori",
        security: [{ cookieAuth: [] }],
        responses: {
          201: { description: "Kategori dibuat" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/admin/categories/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      patch: {
        tags: ["Admin"],
        summary: "Perbarui kategori",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Kategori diperbarui" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Nonaktifkan kategori",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Kategori dinonaktifkan" },
          409: { description: "Kategori masih memiliki produk aktif" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/admin/orders": {
      get: {
        tags: ["Admin"],
        summary: "Daftar seluruh pesanan",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "PENDING_PAYMENT",
                "PAID",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
                "EXPIRED",
                "FAILED",
                "REFUNDED",
              ],
            },
          },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: { 200: { description: "Daftar pesanan dengan meta" } },
      },
    },
    "/admin/orders/{orderNumber}": {
      parameters: [
        {
          name: "orderNumber",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      get: {
        tags: ["Admin"],
        summary: "Detail pesanan admin",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Detail pesanan, pembayaran, pengiriman, timeline" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/admin/orders/{orderNumber}/status": {
      parameters: [
        {
          name: "orderNumber",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      patch: {
        tags: ["Admin"],
        summary: "Ubah status pesanan",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string" },
                  note: { type: "string", maxLength: 240 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Status diperbarui, stok & notifikasi disesuaikan" },
          409: { description: "Transisi status tidak valid" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/admin/orders/{orderNumber}/shipment": {
      parameters: [
        {
          name: "orderNumber",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      patch: {
        tags: ["Admin"],
        summary: "Perbarui pengiriman dan nomor resi",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Pengiriman diperbarui dan event tercatat" },
          409: { description: "Status pesanan belum memungkinkan pengiriman" },
        },
      },
    },
    "/admin/news": {
      get: {
        tags: ["Admin"],
        summary: "Daftar artikel news termasuk draft",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Daftar artikel news" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Buat artikel news",
        security: [{ cookieAuth: [] }],
        responses: {
          201: { description: "Artikel dibuat" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/admin/news/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      get: {
        tags: ["Admin"],
        summary: "Detail artikel news",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Artikel beserta produk terkait" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "Perbarui artikel news",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Artikel diperbarui" } },
      },
      delete: {
        tags: ["Admin"],
        summary: "Hapus artikel news",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Artikel dihapus" } },
      },
    },
    "/admin/help": {
      get: {
        tags: ["Admin"],
        summary: "Daftar artikel bantuan termasuk draft",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Daftar artikel bantuan" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Buat artikel bantuan",
        security: [{ cookieAuth: [] }],
        responses: {
          201: { description: "Artikel dibuat" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/admin/help/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      get: {
        tags: ["Admin"],
        summary: "Detail artikel bantuan",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Artikel bantuan" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "Perbarui artikel bantuan",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Artikel diperbarui" } },
      },
      delete: {
        tags: ["Admin"],
        summary: "Hapus artikel bantuan",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Artikel dihapus" } },
      },
    },
    "/admin/coupons": {
      get: {
        tags: ["Admin"],
        summary: "Daftar voucher",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Daftar voucher" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Buat voucher",
        security: [{ cookieAuth: [] }],
        responses: {
          201: { description: "Voucher dibuat" },
          409: { description: "Kode voucher sudah digunakan" },
          422: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/admin/coupons/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      patch: {
        tags: ["Admin"],
        summary: "Perbarui voucher",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Voucher diperbarui" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Nonaktifkan voucher",
        security: [{ cookieAuth: [] }],
        responses: { 200: { description: "Voucher dinonaktifkan" } },
      },
    },
  },
};
