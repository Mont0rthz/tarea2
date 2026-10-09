import type { Request, Response } from "express";
import pool from "../conf/dbConnection.ts";

export class ProductController {

  async getAllProducts(_req: Request, res: Response) {
    const query = "select * from products where active = TRUE";
    pool
      .execute(query)
      .then(([result, _]) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "internal server error" });
      });
  }

  async getProductById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        res.status(400).json({ message: "id must be a positive number" });
        return;
      }

      const query = `select * from products where id = ? and active = TRUE`;
      const [result, _] = await pool.execute(query, [id]);
      
      const products = result as any[];
      if (products.length === 0) {
        res.status(404).json({ message: "Product not found or inactive" });
        return;
      }
      
      res.json(products[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "internal server error" });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const { name, price, stock, description, brand, img } = req.body;

      if (!name || price === undefined || stock === undefined || !description) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }
      
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice <= 0) {
        res.status(400).json({ message: "Price must be a number greater than 0" });
        return;
      }

      const query = `
        insert into products (name, price, stock, description, brand, img, active)
        values (?, ?, ?, ?, ?, ?, TRUE)
      `;

      const [result] = await pool.execute(query, [name, numericPrice, stock, description, brand || null, img || null]);
      res.status(201).json({ message: "product created", insertId: (result as any).insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "internal server error" });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        res.status(400).json({ message: "id must be a positive number" });
        return;
      }

      const { name, price, stock, description, brand, img } = req.body;
      const numericPrice = Number(price);

      if (!name || Number.isNaN(numericPrice) || numericPrice <= 0 || stock === undefined || !description) {
         res.status(400).json({ message: "Invalid or missing fields. Price must be > 0" });
         return;
      }

      const query = `update products set name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? where id = ? and active = TRUE`;
      
      const [result] = await pool.execute(query, [name, numericPrice, stock, description, brand || null, img || null, id]) as any;
      
      if (result.affectedRows > 0) {
         res.json({ message: "product updated" });
         return;
      }
      res.status(404).json({ message: "product not found or inactive" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "internal server error" });
    }
  }

  async changePrice(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        res.status(400).json({ message: "id must be a positive number" });
        return;
      }

      const { price } = req.body;
      const numericPrice = Number(price);

      if (Number.isNaN(numericPrice) || numericPrice <= 0) {
         res.status(400).json({ message: "Price must be a valid number greater than 0" });
         return;
      }

      const query = `update products set price = ? where id = ? and active = TRUE`;
      const [result] = await pool.execute(query, [numericPrice, id]) as any;

      if (result.affectedRows > 0) {
         res.json({ message: "product price updated" });
         return;
      }
      res.status(404).json({ message: "product not found or inactive" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "internal server error" });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        res.status(400).json({ message: "id must be a positive number" });
        return;
      }
      
      const query = `update products set active = FALSE where id = ? and active = TRUE`;
      const [result] = await pool.execute(query, [id]) as any;

      if (result.affectedRows > 0) {
         res.json({ message: `product with id ${id} logically deleted` });
         return;
      }
      res.status(404).json({ message: "product not found or already inactive" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "internal server error" });
    }
  }
}