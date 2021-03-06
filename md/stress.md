# Стресс-тестирование

* Метод поиска багов, заключающийся в генерации случайных тестов и сравнивании результатов двух решений
* Очень полезен на школьных олимпиадах, когда есть много времени, или когда уже написано решение на маленькие подгруппы
* Через стрессы можно понять правильность прочтения условия. Если сначала пытаться написать слабое решение, не нужно пытаться его пропихнуть, если оно не заходит. Его можно использовать для локальной проверки более быстрых решений. Если же оно зашло, то и не нужны решения быстрее.

Суть такая:

* Есть решение `smart` — быстрое, но в котором есть баг, который хотим найти
* Пишем решение `stupid` — медленное, но точно корректное
* Пишем генератор `gen` — печатает какой-то корректный тест, сгенерированный случайно
* Кормим всё в скрипт `checker`, который n раз генерирует тест, даёт его на ввод `stupid`-у и `smart`-у, сравнивает выводы и останавливается, когда они отличаются

## Как это выглядит в реальной жизни

**Задача**. Есть массив чисел $1 \le a_1 ... a_n \le 10^9$. Найдите значение минимального элемента.

Приведем код решения `stupid`, который будем использовать в качестве эталонного:

```cpp
int a[maxn];

void stupid() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++)
        cin >> a[i];
    int ans = 1e9;
    for (int i = 0; i < n; i++)
        ans = min(ans, a[i]);
    cout << ans;
}
```

Пусть у нас есть решение `smart`, которое содержит ошибку в границах цикла:

```cpp
int a[maxn];

void smart() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++)
        cin >> a[i];
    int ans = 1e9;
    for (int i = 1; i < n; i++)
        ans = min(ans, a[i]);
    cout << ans;
}
```

Даже в таком примере можно долго искать ошибку, если подбирать случайные тесты руками и проверять ответ на правильность, поэтому мы хотим найти тест, на котором два решения будут давать разный ответ, чтобы впоследствии найти ошибку в `smart`.

## Стресс-тестирование inline

*Примечание*. Автор не рекомендует так делать, но многим такой подход кажется проще для понимания.

Суть в следующем:

* Все решения и генераторы помещаются в отдельные методы.
* Тесты рекомендуется передавать либо строками, либо через файл, но особо уверенные в себе могут использовать глобальные переменные.
* Быть аккуратным с очищением глобальных переменных.
* Запустить и получить тест.
* Profit.

```cpp
int a[maxn];
int n;

int stupid() {
    int n;
    cin >> n;
    int ans = 1e9;
    for (int i = 0; i < n; i++)
        ans = min(ans, a[i]);
    return ans;
}

int smart() {
    int n;
    cin >> n;
    int ans = 1e9;
    for (int i = 1; i < n; i++)
        ans = min(ans, a[i]);
    return ans;
}

void gen() {
    n = rand() % 10 + 1;
    for (int i = 0; i < n; i++) {
        a[i] = rand();
    }
}

int main() {
    for (int i = 0; i < 100; i++) {
        gen();
        if (smart() != stupid()) {
            cout << "WA" << endl;
            cout << n << endl;
            for (int j = 0; j < n; j++) {
                cout << a[j] << ' ';
            }
            break;
        }
        cout << "OK" << endl;
    }
    return 0;
}
```

## Script-based стресс-тестирование

Суть в следующем:

* Все решения и генераторы помещаются в отдельные файлы.
* Тесты рекомендуется передавать через перенаправление потоков ввода-вывода.
* Быть аккуратным не надо — мы работаем с тем же самым решением, которое отправим в тестирующую систему.
* Запустить и получить тест.
* ~~Если вы не работаете под Linux, то начните уже наконец работать под Linux.~~ Пользователи винды могут придумать что-то свое.
* Если вы не знаете Python, то выучите уже наконец Python.
* Profit.

Файлы `stupid.cpp`, `smart.cpp` и `gen.py` содержат уже понятный нам код.

Вот примерный код скрипта `checker.py`:

```python
import os, sys

_, f1, f2, gen, iters = sys.argv # первый аргумент - 'checker.py' поэтому "откинем" его с помощью _

for i in range(int(iters)):
    print('Test', i+1)
    os.popen('python3 %s > test.txt' % gen)
    v1 = os.popen('./%s < test.txt' % f1).readlines()
    v2 = os.popen('./%s < test.txt' % f2).readlines()
    if v1 != v2:
        print("FAIL!\nInput:")
        print(*(open("text.txt").readlines()))
        print("Correct output:")
        print(*v1)
        print("Wrong output:")
        print(*v2)
        sys.exit()
print("No output differences found.")
```

* Автор обычно запускает его командой `python3 checker.py stupid smart gen.py 100`, предварительно скомпилировав `stupid` и `smart` в ту же директорию, что и сам `checker.py`.
* При желании можно компилировать прямо внутри скрипта.
* Не забывайте, что если хотя бы одна из программ не выводит перевод строки в конце файла, то чекер посчитает, что вывод разный.
* Если задача подразумевает неоднозначный вывод (к примеру, вывести индекс минимума — таких может быть несколько), то вместо `v1 != v2` следует использовать сторонний скрипт `compare.py`.
* Скрипт написан под Linux. Для Windows нужно убрать «`./`» во всех системных вызовах и вместо "python3" писать "python".

### Пример под Windows через `cmd`

Пусть есть четыре программы.

1. `good.exe` это условный эталон решения. stdin --> stdout

2. `test.exe` это проверяемая прогамма. stdin --> stdout

3. `gen.exe` это генератор тестов. argv --> stdout

4. `compare.exe` это проверяльщик решений. argv --> stdout

Сделаем `run.bat` следующего содержания:

```powershell
:reset
gen >in.txt
type in.txt | good >out.g.txt
type in.txt | test >out.i.txt
compare in.txt out.g.txt out.i.txt
goto reset
```

`compare` должен прерывать выполнение всего цикла в случае несовпадения, то есть ожидать действия от пользователя.

Перед запуском необходимо проверить праильность тупого решения, загнав его в тестирующую систему.

Этот вариант не поддерживает ограничение числа тестов, но если надо, то его всегда можно прикрутить.
