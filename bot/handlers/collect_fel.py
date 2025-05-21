from telegram import Update
from telegram.ext import CommandHandler, ContextTypes

async def collect_fel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("✅ Фел-скверна собрана!")

collect_fel_handler = CommandHandler("fel", collect_fel)
