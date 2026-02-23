import mongoose from "mongoose";
import Product from "../models/product.js";
import { isItAdmin } from "./userController.js";

export function addProduct(req,res){

    if(req.user==null){
        res.status(401).json({
            message : "Please login and try again"
        })
        return
    }
    if(req.user.role !="admin"){
        res.status(403).json({
            message : "You are not authorized to perform this action"
        })
        return
    }
    const data=req.body;
    const newProduct=new Product(data);
    newProduct.save()
    .then(()=>{
        res.json({message : "Product add successfully"});
    })
    .catch((error)=>{
        res.status(500).json({error : "Product adition failed "})
    });
}
export async function getProducts(req,res){

    try{
        if(isItAdmin(req)){
            const products=await Product.find();
            res.json(products);
            return;

        }else{
            const products=await Product.find({availability : true});
            res.json(products);
            return;
        }
    }catch(e){
        res.status(500).json({
            message : "Failed to get products"
        })
    }
}
//update product

export async function updateProduct(req,res){
    try{
        if(isItAdmin(req)){
            const key=req.params.key
            const data=req.body;

            await Product.updateOne({key :key},data)
            //first key-what change product,secod key-apikey with come key
            //this Product use make a connection in database collecton and and code
            // updateOne Product has method
            res.json({
                message : "Product updated successfully"
            })

        }else{
            res.status(403).json({
                message : "You are not authorized to perform this action"
            })
        }
    }catch(e){
        res.status(500).json({
            message : "Failed to update product"
        })
    }
}
//delete product

export async function deleteProduct(req,res){
    try{
        if(isItAdmin(req)){
            const key=req.params.key; //get the key from parameter("/:key")
            await Product.deleteOne({key:key})
            res.json({
                message : "Product deleted successfully "
            })
        }else{
            res.status(403).json({
                message : "You are not authorize to perform this action"
            })
        }

    }catch(e){
        res.status(500).json({
            message : "Failed to delete product"
        })

    }
}

export async function getProduct(req,res){
    try{
        const key=req.params.key
        const product=await Product.findOne({key:key})
        if(product==null){
            res.status(404).json({
                message:"Product not found"
            })
            return;
        }
        res.json(product)
        return;
    }catch(e){
        res.status(500).json({
            message:"Failed to get product"
        })

    }
}