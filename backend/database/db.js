import mongoose  from "mongoose";

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.DATABASE_URI)
        console.log(`Database Connectrd at ${process.env.DATABASE_URI}`)

    } catch (error) {
        console.error(`Error: ${error.message}`)
    }
}
export default connectDB