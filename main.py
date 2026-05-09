import tkinter as tk
from tkcalendar import Calendar

# 메모 저장용 딕셔너리
memo_data = {}


def select_date():
    selected = cal.get_date()
    entry.delete(0, tk.END)

    # 기존 메모 불러오기
    if selected in memo_data:
        entry.insert(0, memo_data[selected])


def save_memo():
    selected = cal.get_date()
    memo_data[selected] = entry.get()
    print(memo_data)


# 창
root = tk.Tk()
root.title("Calendar Todo")
root.geometry("400x500")

# 달력
cal = Calendar(root, selectmode='day')
cal.pack(pady=10)

# 날짜 선택 버튼
btn_select = tk.Button(root, text="날짜 선택", command=select_date)
btn_select.pack()

# 입력창
entry = tk.Entry(root, width=30)
entry.pack(pady=10)

# 저장 버튼
btn_save = tk.Button(root, text="메모 저장", command=save_memo)
btn_save.pack()

root.mainloop()