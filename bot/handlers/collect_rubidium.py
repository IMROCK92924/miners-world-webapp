from telegram import Update
from telegram.ext import CommandHandler, ContextTypes

async def collect_rubidium(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("✅ Рубидий собран!")

collect_rubidium_handler = CommandHandler("rubidium", collect_rubidium)
