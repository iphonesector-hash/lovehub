#!/bin/bash
cd "$(dirname "$0")"

# فعال‌سازی venv
source ../venv/bin/activate

# اجرا با gunicorn (production)
exec gunicorn -w 2 -b 127.0.0.1:5000 --timeout 120 app:app

