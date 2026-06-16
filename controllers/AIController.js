import Car from '../models/Cars.js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `Ти — АвтоГуру, експертний AI-асистент автомобільного маркетплейсу MVP CARS (Україна).

Твої можливості:
- Підбір автомобіля за бюджетом, потребами та стилем життя
- Порівняння марок і моделей (надійність, витрата, обслуговування)
- Технічні характеристики будь-якого авто
- Поради щодо покупки: на що звертати увагу, типові проблеми моделей
- Орієнтовні ціни на ринку України
- Поради по обслуговуванню та експлуатації

Правила:
- Відповідай ВИКЛЮЧНО українською мовою
- Будь конкретним і корисним, без зайвої води
- Якщо питання не стосується автомобілів — ввічливо поясни, що ти автомобільний асистент
- Використовуй емодзі помірно для кращого сприйняття
- Структуруй відповіді — використовуй списки де доречно`

export const chat = async (req, res) => {
  try {
    const { messages, carsContext } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Невірний формат повідомлень' })
    }

    // Формуємо системний промпт з контекстом оголошень якщо є
    let systemContent = SYSTEM_PROMPT
    if (carsContext && carsContext.length > 0) {
      systemContent += `\n\nПоточні оголошення на сайті (можеш рекомендувати їх):\n`
      carsContext.forEach(car => {
        systemContent += `- ${car.brand} ${car.model} ${car.year}, ${car.priceUSD}$, ${car.fuelType}, ${car.mileage} км, стан: ${car.condition}\n`
      })
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemContent },
          ...messages
        ],
        max_tokens: 1024,
        temperature: 0.7,
      })
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Groq API error:', err)
      return res.status(500).json({ error: 'Помилка AI сервісу' })
    }

    const data = await response.json()
    const reply = data.choices[0].message.content

    res.json({ reply })

  } catch (error) {
    console.error('AiController error:', error)
    res.status(500).json({ error: 'Внутрішня помилка сервера' })
  }
}

// Окремий ендпоінт який підтягує реальні авто з БД як контекст
export const chatWithCars = async (req, res) => {
  try {
    const cars = await Car.find({ status: 'active' })
      .select('brand model year priceUSD fuelType mileage condition bodyType transmission')
      .limit(20)
      .lean()

    req.body.carsContext = cars
    return chat(req, res)
  } catch (error) {
    console.error('chatWithCars error:', error)
    res.status(500).json({ error: 'Внутрішня помилка сервера' })
  }
}