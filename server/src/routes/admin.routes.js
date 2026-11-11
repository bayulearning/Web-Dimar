import { Router } from "express";
import {
  getCategories,
  getCoupons,
  getDashboardHandler,
  getHelp,
  getHelpHandler,
  getNews,
  getNewsHandler,
  getOrderHandler,
  getOrders,
  getProductHandler,
  getProducts,
  patchCategory,
  patchCoupon,
  patchHelp,
  patchNews,
  patchOrderStatus,
  patchProduct,
  patchProductImage,
  patchShipment,
  patchVariant,
  patchVariantStock,
  postCategory,
  postCoupon,
  postHelp,
  postNews,
  postProduct,
  postProductImage,
  postVariant,
  removeCategory,
  removeCoupon,
  removeHelp,
  removeNews,
  removeProduct,
  removeProductImage,
  removeVariant,
} from "../controllers/admin.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../validators/common.js";
import {
  adminIdParamSchema,
  adminListQuerySchema,
  adminOrderListQuerySchema,
  adminOrderParamSchema,
  adminProductImageParamSchema,
  adminProductListQuerySchema,
  adminProductVariantParamSchema,
  categorySchema,
  createCouponSchema,
  createHelpSchema,
  createNewsSchema,
  createProductSchema,
  createVariantSchema,
  productImageSchema,
  updateCategorySchema,
  updateCouponSchema,
  updateHelpSchema,
  updateNewsSchema,
  updateOrderStatusSchema,
  updateProductImageSchema,
  updateProductSchema,
  updateShipmentSchema,
  updateVariantSchema,
  updateVariantStockSchema,
} from "../validators/admin.validator.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get("/dashboard", asyncHandler(getDashboardHandler));

/* Products */
adminRouter.get(
  "/products",
  validateQuery(adminProductListQuerySchema),
  asyncHandler(getProducts),
);
adminRouter.post(
  "/products",
  validateBody(createProductSchema),
  asyncHandler(postProduct),
);
adminRouter.get(
  "/products/:id",
  validateParams(adminIdParamSchema),
  asyncHandler(getProductHandler),
);
adminRouter.patch(
  "/products/:id",
  validateParams(adminIdParamSchema),
  validateBody(updateProductSchema),
  asyncHandler(patchProduct),
);
adminRouter.delete(
  "/products/:id",
  validateParams(adminIdParamSchema),
  asyncHandler(removeProduct),
);

/* Product images */
adminRouter.post(
  "/products/:id/images",
  validateParams(adminIdParamSchema),
  validateBody(productImageSchema),
  asyncHandler(postProductImage),
);
adminRouter.patch(
  "/products/:id/images/:imageId",
  validateParams(adminProductImageParamSchema),
  validateBody(updateProductImageSchema),
  asyncHandler(patchProductImage),
);
adminRouter.delete(
  "/products/:id/images/:imageId",
  validateParams(adminProductImageParamSchema),
  asyncHandler(removeProductImage),
);

/* Product variants & stock */
adminRouter.post(
  "/products/:id/variants",
  validateParams(adminIdParamSchema),
  validateBody(createVariantSchema),
  asyncHandler(postVariant),
);
adminRouter.patch(
  "/products/:id/variants/:variantId",
  validateParams(adminProductVariantParamSchema),
  validateBody(updateVariantSchema),
  asyncHandler(patchVariant),
);
adminRouter.patch(
  "/products/:id/variants/:variantId/stock",
  validateParams(adminProductVariantParamSchema),
  validateBody(updateVariantStockSchema),
  asyncHandler(patchVariantStock),
);
adminRouter.delete(
  "/products/:id/variants/:variantId",
  validateParams(adminProductVariantParamSchema),
  asyncHandler(removeVariant),
);

/* Categories */
adminRouter.get("/categories", asyncHandler(getCategories));
adminRouter.post(
  "/categories",
  validateBody(categorySchema),
  asyncHandler(postCategory),
);
adminRouter.patch(
  "/categories/:id",
  validateParams(adminIdParamSchema),
  validateBody(updateCategorySchema),
  asyncHandler(patchCategory),
);
adminRouter.delete(
  "/categories/:id",
  validateParams(adminIdParamSchema),
  asyncHandler(removeCategory),
);

/* Orders */
adminRouter.get(
  "/orders",
  validateQuery(adminOrderListQuerySchema),
  asyncHandler(getOrders),
);
adminRouter.get(
  "/orders/:orderNumber",
  validateParams(adminOrderParamSchema),
  asyncHandler(getOrderHandler),
);
adminRouter.patch(
  "/orders/:orderNumber/status",
  validateParams(adminOrderParamSchema),
  validateBody(updateOrderStatusSchema),
  asyncHandler(patchOrderStatus),
);
adminRouter.patch(
  "/orders/:orderNumber/shipment",
  validateParams(adminOrderParamSchema),
  validateBody(updateShipmentSchema),
  asyncHandler(patchShipment),
);

/* News */
adminRouter.get(
  "/news",
  validateQuery(adminListQuerySchema),
  asyncHandler(getNews),
);
adminRouter.post(
  "/news",
  validateBody(createNewsSchema),
  asyncHandler(postNews),
);
adminRouter.get(
  "/news/:id",
  validateParams(adminIdParamSchema),
  asyncHandler(getNewsHandler),
);
adminRouter.patch(
  "/news/:id",
  validateParams(adminIdParamSchema),
  validateBody(updateNewsSchema),
  asyncHandler(patchNews),
);
adminRouter.delete(
  "/news/:id",
  validateParams(adminIdParamSchema),
  asyncHandler(removeNews),
);

/* Help */
adminRouter.get(
  "/help",
  validateQuery(adminListQuerySchema),
  asyncHandler(getHelp),
);
adminRouter.post(
  "/help",
  validateBody(createHelpSchema),
  asyncHandler(postHelp),
);
adminRouter.get(
  "/help/:id",
  validateParams(adminIdParamSchema),
  asyncHandler(getHelpHandler),
);
adminRouter.patch(
  "/help/:id",
  validateParams(adminIdParamSchema),
  validateBody(updateHelpSchema),
  asyncHandler(patchHelp),
);
adminRouter.delete(
  "/help/:id",
  validateParams(adminIdParamSchema),
  asyncHandler(removeHelp),
);

/* Coupons */
adminRouter.get(
  "/coupons",
  validateQuery(adminListQuerySchema),
  asyncHandler(getCoupons),
);
adminRouter.post(
  "/coupons",
  validateBody(createCouponSchema),
  asyncHandler(postCoupon),
);
adminRouter.patch(
  "/coupons/:id",
  validateParams(adminIdParamSchema),
  validateBody(updateCouponSchema),
  asyncHandler(patchCoupon),
);
adminRouter.delete(
  "/coupons/:id",
  validateParams(adminIdParamSchema),
  asyncHandler(removeCoupon),
);
