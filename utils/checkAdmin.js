import UserModel from '../models/User.js'

export default async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user || user.role !== 'admin') { 
            return res.status(403).json({ message: 'Тільки для адміна' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Відсутній доступ' });
    }
};