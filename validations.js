import {body} from 'express-validator'

export const loginValidation = [
    body('email', 'Невірний формат пошти').isEmail(),
    body('password', 'Пароль має бути мінімум 5 символів').isLength({ min: 5 }),
]

export const registerValidation = [
    body('email', 'Невірний формат пошти').isEmail(),
    body('password', 'Пароль має бути мінімум 5 символів').isLength({ min: 5 }),
    body('fullName', 'Вкажіть імʼя (мінімум 3 символи)').isLength({ min: 3 }),
    body('avatarUrl', 'Невірне посилання на аватар').optional().isURL(),
]

export const carCreateValidation = [
    body('brand', 'Вкажіть марку').isString().isLength({ min: 1 }),
    body('model', 'Вкажіть модель').isString().isLength({ min: 1 }),
    body('year', 'Вкажіть рік').isNumeric(),
    body('priceUSD', 'Вкажіть ціну').isNumeric(),
    body('mileage', 'Вкажіть пробіг').isNumeric(),
    body('fuelType', 'Вкажіть тип палива').isString(),
    body('phone', 'Вкажіть телефон').isString().isLength({ min: 10 }),
]