import tkinter as tk
from tkcalendar import Calendar

root = tk.Tk()
root.title("Todo App")
root.geometry("390x700")
root.resizable(False, False)

# 제목
title = tk.Label(root, text="       Todo Calendar", font=("Arial", 18))
title.place(x=90, y=20)

# 달력 (절반)
cal = Calendar(root, selectmode='day', font=("Arial", 16))
cal.place(x=20, y=80, width=350, height=300)

# 입력창
entry = tk.Entry(root)
entry.place(x=70, y=420, width=250)

# 버튼
btn = tk.Button(root, text="저장")
btn.place(x=150, y=460)

root.mainloop()