from telegram.ext import Application
from handlers.start import start_handler
from handlers.collect_iridium import collect_iridium_handler
from handlers.collect_rubidium import collect_rubidium_handler
from handlers.collect_fel import collect_fel_handler
import os
from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

app = Application.builder().token(BOT_TOKEN).build()

app.add_handler(start_handler)
app.add_handler(collect_iridium_handler)
app.add_handler(collect_rubidium_handler)
app.add_handler(collect_fel_handler)

print("Бот запущен!")
app.run_polling()
