export async function createOrder(req,res){
    const data=req.body;
    const orderInfo={

    }
    "ORD0001"

    const lastOrder=Order.find().sort({orderNumber:-1}).limit(1);
    if(lastOrder.length==0){
        orderInfo.orderId="ORD0001";
    }else{
        const lastOrderId=lastOrder[0].orderId;
        const lastOrderNumber=parseInt(lastOrderId.substring(3));
        orderInfo.orderId="ORD"+(lastOrderNumber+1);
    }
}