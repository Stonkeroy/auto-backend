import mongoose from "mongoose"

const CarSchema = new mongoose.Schema({
    
    brand: { type: String, required: true },      
    model: { type: String, required: true },      
    year:  { type: Number, required: true },      
    generation: String,                           

    
    priceUSD: { type: Number, required: true },   
    priceUAH: Number,                             

    
    mileage:      { type: Number, required: true }, 
    fuelType:     { 
        type: String, 
        enum: ['Бензин', 'Дизель', 'Газ/Бензин', 'Електро', 'Гібрид'],
        required: true 
    },
    engineVolume:  Number,                          
    enginePower:   Number,                          
    transmission: { 
        type: String, 
        enum: ['Автомат', 'Механіка', 'Типтронік', 'Робот', 'Варіатор'] 
    },
    driveType: {
        type: String,
        enum: ['Повний', 'Передній', 'Задній']      
    },
    bodyType: {
        type: String,
        enum: ['Седан', 'Позашляховик', 'Хетчбек', 'Універсал', 'Купе', 'Мінівен', 'Кабріолет']
    },
    color: String,                                  

    
    trim: String,                                   

    country: { type: String, default: 'Україна' },
    region:  String,                                
    city:    String,                                
    zip:     String,                                

    licensePlate: String,                           
    vin:          String,                          


    condition: {
        type: String,
        enum: ['Гарний', 'Ідеальний', 'Потребує ремонту'],
        default: 'Ідеальний'
    },
    inAccident:    { type: Boolean, default: false },  
    importedFromUSA: { type: Boolean, default: false }, 
    firstRegistration: Boolean,                         
    bargain:       { type: Boolean, default: false },   
    creditAvailable: { type: Boolean, default: false }, 

    images: [String],                               

    description: String,

    seller: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    phone: { type: String, required: true },

    viewsCount: { type: Number, default: 0 },
    status: {
    type: String,
    enum: ['pending', 'active', 'rejected'],
    default: 'pending'
},
rejectedReason: String,

}, { timestamps: true })


export default mongoose.model('Car', CarSchema)