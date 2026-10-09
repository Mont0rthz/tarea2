import { Router } from "express";
import { ProductController } from "../controllers/products.controller.ts";

const router = Router();
const productController = new ProductController();

router.get('/getAll', productController.getAllProducts);
router.get('/getById/:id', productController.getProductById);
router.post('/create', productController.createProduct);
router.put('/update/:id', productController.updateProduct);
router.patch('/change-price/:id', productController.changePrice);
router.delete('/delete/:id', productController.deleteProduct);

export default router;