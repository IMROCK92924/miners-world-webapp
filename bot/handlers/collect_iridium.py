from telegram import Update
from telegram.ext import CommandHandler, ContextTypes

async def collect_iridium(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("✅ Иридиум собран!")

collect_iridium_handler = CommandHandler("iridium", collect_iridium)
