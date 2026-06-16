import CarModel from '../models/Cars.js'

export const getAll = async (req, res) => {
    try {
        const { brand, model, minPrice, maxPrice, year, 
                fuelType, transmission, bodyType, region, condition } = req.query

        const filter = { status: 'active' } 
        
        if (brand)        filter.brand = brand
        if (model)        filter.model = model
        if (year)         filter.year = Number(year)
        if (fuelType)     filter.fuelType = fuelType
        if (transmission) filter.transmission = transmission
        if (bodyType)     filter.bodyType = bodyType
        if (region)       filter.region = region
        if (condition)    filter.condition = condition
        if (minPrice || maxPrice) {
            filter.priceUSD = {}
            if (minPrice) filter.priceUSD.$gte = Number(minPrice)
            if (maxPrice) filter.priceUSD.$lte = Number(maxPrice)
        }

        const cars = await CarModel.find(filter)
            .populate('seller', ['fullName', 'avatarUrl', 'phone'])
            .sort({ createdAt: -1 })

        res.json(cars)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Не вдалось отримати оголошення' })
    }
}

export const getOne = async (req, res) => {
    try {
        const car = await CarModel.findOneAndUpdate(
            { _id: req.params.id },
            { $inc: { viewsCount: 1 } },
            { returnDocument: 'after' }
        ).populate('seller', ['fullName', 'avatarUrl', 'phone'])

        if (!car) {
            return res.status(404).json({ message: 'Оголошення не знайдено' })
        }

        res.json(car)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Не вдалось отримати оголошення' })
    }
}

export const create = async (req, res) => {
    try {
        const doc = new CarModel({
            brand:           req.body.brand,
            model:           req.body.model,
            year:            req.body.year,
            generation:      req.body.generation,
            priceUSD:        req.body.priceUSD,
            priceUAH:        req.body.priceUAH,
            mileage:         req.body.mileage,
            fuelType:        req.body.fuelType,
            engineVolume:    req.body.engineVolume,
            enginePower:     req.body.enginePower,
            transmission:    req.body.transmission,
            driveType:       req.body.driveType,
            bodyType:        req.body.bodyType,
            color:           req.body.color,
            trim:            req.body.trim,
            region:          req.body.region,
            city:            req.body.city,
            zip:             req.body.zip,
            licensePlate:    req.body.licensePlate,
            vin:             req.body.vin,
            condition:       req.body.condition,
            inAccident:      req.body.inAccident,
            importedFromUSA: req.body.importedFromUSA,
            firstRegistration: req.body.firstRegistration,
            bargain:         req.body.bargain,
            creditAvailable: req.body.creditAvailable,
            images:          req.body.images,
            description:     req.body.description,
            phone:           req.body.phone,
            seller:          req.userId, 
        })

        const car = await doc.save()
        res.json(car)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Не вдалось створити оголошення' })
    }
}

export const remove = async (req, res) => {
    try {
        const car = await CarModel.findById(req.params.id)

        if (!car) {
            return res.status(404).json({ message: 'Оголошення не знайдено' })
        }

        if (car.seller.toString() !== req.userId) {
            return res.status(403).json({ message: 'Це не ваше оголошення' })
        }

        await CarModel.findByIdAndDelete(req.params.id)
        res.json({ success: true })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Не вдалось видалити оголошення' })
    }
}

export const update = async (req, res) => {
    try {
        const car = await CarModel.findById(req.params.id)

        if (!car) {
            return res.status(404).json({ message: 'Оголошення не знайдено' })
        }

        if (car.seller.toString() !== req.userId) {
            return res.status(403).json({ message: 'Це не ваше оголошення' })
        }

        await CarModel.updateOne(
            { _id: req.params.id },
            { $set: { ...req.body, status: 'pending' } } 
        )

        res.json({ success: true })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Не вдалось оновити оголошення' })
    }
}

export const getMyCars = async (req, res) => {
    try {
        const cars = await CarModel.find({ seller: req.userId })
            .sort({ createdAt: -1 })

        res.json(cars)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Не вдалось отримати оголошення' })
    }
}

export const getPending = async (req, res) => {
    try {
        const cars = await CarModel.find({ status: 'pending' })
            .populate('seller', ['fullName', 'email'])
            .sort({ createdAt: -1 })

        res.json(cars)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Помилка' })
    }
}

export const moderate = async (req, res) => {
    try {
        const { status, rejectedReason } = req.body

        await CarModel.updateOne(
            { _id: req.params.id },
            { $set: { status, rejectedReason } }
        )

        res.json({ success: true })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Помилка' })
    }
}