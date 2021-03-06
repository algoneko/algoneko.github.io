# Поиск строки в строке

Рассмотрим задачу, которая возникает каждый раз, когда вы делаете `ctrl+f`:

> Есть большой текст $t$. Нужно найти все вхождения строки $s$ в него.

Наивное решение со сравнением всех подстрок $t$ длины $|s|$ со строкой $s$ работает за $\O(|t| \cdot |s|)$. Если текст большой, то длинные слова в нем искать становится очень долго.

Однако существует множество способов решить эту задачу за $\O(|s| + |t|)$, два самых распространённых и простых из них: через *префикс-функцию* и через *z-функцию* (*примечание: не «зи», а «зет»*).

## Префикс-функция

**Определение**. Префикс-функцией от строки $s$ называется массив $p$, где $p_i$ равно длине самого большого префикса строки $s_0 s_1 s_2 \ldots s_i$, который также является и суффиксом $i$-того префика (не считая весь $i$-й префикс).

Например, самый большой префикс, который равен суффиксу для строки `aataataa` — это `aataa`; префикс-функция для этой строки равна $[0, 1, 0, 1, 2, 3, 4, 5]$.

```cpp
vector<int> slow_prefix_function(string s) {
    int n = (int) s.size();
    vector<int> p(n, 0);
    for (int i = 1; i < n; i++)
        for (int len = 1; len <= i; len++)
            // если префикс длины len равен суффиксу длины len
            if (s.substr(0, len) == s.substr(i - len + 1, len))
                p[i] = len;
    return p;
}
```

Этот алгоритм пока что работает за $\O(n^3)$, но позже мы его ускорим.

### Как это поможет решить исходную задачу?

Давайте пока поверим, что мы умеем считать префикс-функцию за линейное от размера строки, и научимся с помощью нее искать подстроку в строке.

Соединим подстроки $s$ и $t$ каким-нибудь символом, который не встречается ни там, ни там — обозначим пусть этот символ #. Посмотрим на префикс-функцию получившейся строки `s#t`.

```cpp
string s = "choose";
string t =
    "choose life. choose a job. choose a career. choose a family. choose a fu...";

cout << s + "#" + t << endl;
cout << slow_prefix_function(s + "#" + t) << endl;
```

Результат:
```
choose#choose life. choose a job. choose a career. choose a family. choose a fu...
0000000123456000000012345600000000123456000100000001234560000000000012345600000000
```

Видно, что все места, где значения равны 6 (длине $s$) — это концы вхождений $s$ в текст $t$.

Такой алгоритм (посчитать префикс-функцию от `s#t` и посмотреть, в каких позициях она равна $|s|$) называется **алгоритмом Кнута-Морриса-Пратта**.

### Как её быстро считать

Рассмотрим ещё несколько примеров префикс-функций и попытаемся найти закономерности:

```
aaaaa
01234

abcdef
000000

abacabadava
00101230101
```

Можно заметить следующую особенность: $p_{i+1}$ максимум на единицу превосходит $p_i$.

**Доказательство.** Если есть префикс, равный суффиксу строки $s_{:i+1}$, длины $p_{i+1}$, то, отбросив последний символ, можно получить правильный суффикс для строки $s_{:i}$, длина которого будет ровно на единицу меньше.

Попытаемся решить задачу с помощью динамики: найдём формулу для $p_i$ через предыдущие значения.

Заметим, что $p_{i+1} = p_i + 1$ в том и только том случае, когда $s_{p_i} =s_{i+1}$. В этом случае мы можем просто обновить $p_{i+1}$ и пойти дальше.

Например, в строке $\underbrace{aabaa}t\overbrace{aabaa}$ выделен максимальный префикс, равный суффиксу: $p_{10} = 5$. Если следующий символ равен будет равен $t$, то $p_{11} = p_{10} + 1 = 6$.

Но что происходит, когда $s_{p_i}\neq s_{i+1}$? Пусть следующий символ в этом же примере равен не $t$, а $b$.

* $\implies$ Длина префикса, равного суффиксу новой строки, будет точно меньше 5.
* $\implies$ Помимо того, что искомый новый супрефикс является суффиксом «aabaa**b**», он ещё является префиксом подстроки «aabaa».
* $\implies$ Значит, следующий кандидат на проверку — это значение префикс-функции от «aabaa», то есть $p_4 = 2$, которое мы уже посчитали.
* $\implies$ Если $s_2 = s_{11}$ (т. е. новый символ совпадает с идущим после префикса-кандидата), то $p_{11} = p_2 + 1 = 2 + 1 = 3$.

В данном случае это действительно так (нужный префикс — «aab»). Но что делать, если, в общем случае, $p_{i+1} \neq p_{p_i+1}$? Тогда мы проводим такое же рассуждение и получаем нового кандидата, меньшей длины — $p_{p_{p_i}}$. Если и этот не подошел — аналогично проверяем меньшего, пока этот индекс не станет нулевым.

```cpp
vector<int> prefix_function(string s) {
    int n = (int) s.size();
    vector<int> p(n, 0);
    for (int i = 1; i < n; i++) {
        // префикс функция точно не больше этого значения + 1
        int cur = p[i - 1];
        // уменьшаем cur значение, пока новый символ не сматчится
        while (s[i] != s[cur] && cur > 0)
            cur = p[cur - 1];
        // здесь либо s[i] == s[cur], либо cur == 0
        if (s[i] == s[cur])
            p[i] = cur + 1;
    }
    return p;
}
```

**Асимптотика.** В худшем случае этот `while` может работать $\O(n)$ раз за одну итерацию, но *в среднем* каждый `while` работает за $\O(1)$.

Префикс-функция каждый шаг возрастает максимум на единицу и после каждой итерации `while` уменьшается хотя бы на единицу. Значит, суммарно операций будет не более $\O(n)$.

## Z-функция

Немногого более простая для понимания альтернатива префикс-функции — z-функция.

Z-функция от строки $s$ определяется как массив $z$, такой что $z_i$ равно длине максимальной подстроки, **начинающейся** с $i$-й позиции, которая равна префиксу $s$.

$$
\underbrace{aba}c\overbrace{aba}daba \hspace{1em} (z_4 = 3)
$$

```cpp
vector<int> slow_z_function (string s) {
    int n = (int) s.size();
    vector<int> z(n, 0); // z[0] считается не определенным
    for (int i = 1; i < n; i++)
        // если мы не вышли за границу и следующие символы совпадают
        while (i + z[i] < n && s[z[i]] == s[i + z[i]])
            z[i]++;
    return z;
}
```

Результат:
```
aaaaa
04321

abcdef
000000

abacabadava
00103010101
```

Z-функцию можно использовать вместо префикс-функции в алгоритме Кнута-Морриса-Пратта — только теперь нужные позиции будут начинаться c $|s|$, а не заканчиваться. Осталось только научиться её искать за $\O(n)$.

### Как её быстро считать

Будем идти слева направо и хранить *z-блок* — самую правую подстроку, равную префиксу, которую мы успели обнаружить. Будем обозначать его границы как $l$ и $r$ включительно.

Пусть мы сейчас хотим найти $z_i$, а все предыдущие уже нашли. Новый $i$-й символ может лежать либо правее z-блока, либо внутри него:

* Если правее, то мы просто наивно перебором найдем $z_i$ (максимальный отрезок, начинающийся с $s_i$ и равный префиксу), и объявим его новым z-блоком.
* Если $i$-й элемент лежит внутри z-блока, то мы можем посмотреть на значение $z_{i-l}$ и использовать его, чтобы инициализировать $z_i$ чем-то, возможно, отличным от нуля. Если $z_{i-l}$ левее правой границы $z$-блока, то $z_i = z_{i-l}$ — больше $z_i$ быть не может. Если он упирается в границу, то «обрежем» его до неё и будем увеличивать на единичку.

```cpp
vector<int> z_function (string s) {
    int n = (int) s.size();
    vector<int> z(n, 0);
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        // если мы уже видели этот символ
        if (i <= r)
            // то мы можем попробовать его инициализировать z[i - l],
            // но не дальше правой границы: там мы уже ничего не знаем
            z[i] = min(r - i + 1, z[i - l]);
        // дальше каждое успешное увеличение z[i] сдвинет z-блок на единицу
        while (i + z[i] < n && s[z[i]] == s[i + z[i]])
            z[i]++;
        // проверим, правее ли мы текущего z-блока
        if (i + z[i] - 1 > r) {
            r = i + z[i] - 1;
            l = i;
        }
    }
    return z;
}
```

**Асимптотика**. В алгоритме мы делаем столько же действий, сколько раз сдвигается правая граница z-блока — а это $\O(n)$.

### Сравнение

В целом они зет- и префикс-функции очень похожи, но алгоритм Кнута-Морриса-Пратта есть во всех классических учебниках по программированию, а про z-функцию почему-то мало кто знает кроме олимпиадных программистов.

Про префикс-функцию важно ещё знать, что она онлайновая — достаточно считать следующий символ, и сразу можно узнать значение.

**Упражнение 1.** Дан массив префикс-функции. Исходная строка не дана. Вычислите за $\O(n)$ зет-функцию этой строки.

**Упражнение 2.** Дан массив зет-функции. Исходная строка не дана. Вычислите за $\O(n)$ префикс-функцию этой строки.

## Применение

### Количество различных подстрок

Дана строка $s$ длины $n$. Требуется посчитать количество её различных подстрок.

Будем решать эту задачу итеративно. А именно, научимся, зная текущее количество различных подстрок, пересчитывать это количество при добавлении в конец одного символа.

Итак, пусть $k$ — текущее количество различных подстрок строки $s$, и мы добавляем в конец символ $c$. Очевидно, в результате могли появиться некоторые новые подстроки, оканчивавшиеся на этом новом символе $c$. А именно, добавляются в качестве новых те подстроки, оканчивающиеся на символе c и не встречавшиеся ранее.

Возьмём строку $t = s + c$ и инвертируем её (запишем символы в обратном порядке). Наша задача — посчитать, сколько у строки $t$ таких префиксов, которые не встречаются в ней более нигде.

**Решение 1. Префикс-функция.** Но если мы посчитаем для строки t префикс-функцию и найдём её максимальное значение $p_{\rm max}$, то, очевидно, в строке $t$ встречается (не в начале) её префикс длины $p_{\rm max}$, но не большей длины. Понятно, префиксы меньшей длины уж точно встречаются в ней. Итак, мы получили, что число новых подстрок, появляющихся при дописывании символа $c$, равно $s.{\rm length}() + 1 - p_{\rm max}$.

**Решение 2. Z-функция.** Но если мы посчитаем для строки $t$ Z-функцию и найдём её максимальное значение $z_{\rm max}$, то, очевидно, в строке $t$ встречается (не в начале) её префикс длины $z_{\rm max}$, но не большей длины. Понятно, префиксы меньшей длины уже точно встречаются в ней. Итак, мы получили, что число новых подстрок, появляющихся при дописывании символа $c$, равно $len - z_{\rm max}$, где $len$ — текущая длина строки после приписывания символа c.

Таким образом, для каждого дописываемого символа мы за $\O(n)$ можем пересчитать количество различных подстрок строки. Следовательно, за $\O(n^2)$ мы можем найти количество различных подстрок для любой заданной строки.

Стоит заметить, что совершенно аналогично можно пересчитывать количество различных подстрок и при дописывании символа в начало, а также при удалении символа с конца или с начала.

### Сжатие строки

Дана строка $s$ длины $n$. Требуется найти самое короткое её "сжатое" представление, т.е. найти такую строку $t$ наименьшей длины, что $s$ можно представить в виде конкатенации одной или нескольких копий $t$.

Понятно, что проблема является в нахождении длины искомой строки $t$. Зная длину, ответом на задачу будет, например, префикс строки $s$ этой длины.

Посчитаем по строке s префикс-функцию. Рассмотрим её последнее значение, т.е. $p[n-1]$, и введём обозначение $k = n - p[n-1]$. Покажем, что если $n$ делится на $k$, то это $k$ и будет длиной ответа, иначе эффективного сжатия не существует, и ответ равен $n$.

Действительно, пусть $n$ делится на $k$. Тогда строку можно представить в виде нескольких блоков длины $k$, причём, по определению префикс-функции, префикс длины $n-k$ будет совпадать с её суффиксом. Но тогда последний блок должен будет совпадать с предпоследним, предпоследний - с предпредпоследним, и т.д. В итоге получится, что все блоки блоки совпадают, и такое $k$ действительно подходит под ответ.

Покажем, что этот ответ оптимален. Действительно, в противном случае, если бы нашлось меньшее $k$, то и префикс-функция на конце была бы больше, чем $n-k$, т.е. пришли к противоречию.

Пусть теперь $n$ не делится на $k$. Покажем, что отсюда следует, что длина ответа равна $n$. Докажем от противного — предположим, что ответ существует, и имеет длину $P$ ($P$ делитель $n$). Заметим, что префикс-функция необходимо должна быть больше $n - P$, т.е. этот суффикс должен частично накрывать первый блок. Теперь рассмотрим второй блок строки; т.к. префикс совпадает с суффиксом, и и префикс, и суффикс покрывают этот блок, и их смещение друг относительно друга $k$ не делит длину блока $P$ (а иначе бы $k$ делило $n$), то все символы блока совпадают. Но тогда строка состоит из одного и того же символа, отсюда $k=1$, и ответ должен существовать, т.е. так мы придём к противоречию.

$ \overbrace{s_0\ s_1\ s_2\ s_3}^{P}\ \overbrace{s_4\ s_5\ s_6\ s_7}^{P} $

$ s_0\ s_1\ s_2\ \underbrace{\overbrace{s_3\ s_4\ s_5\ s_6}^{P}\ s_7}_{p[7]=5}$

$ s_4=s_3,\ \ s_5=s_4,\ \ s_6=s_5,\ \ s_7=s_6\ \ \ \Ra \ \ \ s_0=s_1=s_2=s_3 $

У этой задачи есть альтернативное решение с помощью Z-функции: посчитаем Z-функцию строки $s$, и найдём первую позицию $i$ такую, что $i + z[i] = n$, и при этом $n$ делится на $i$. Тогда строку $s$ можно сжать до строки длины $i$. Доказательство такого решения практически не отличается от доказательства решения с помощью префикс-функции.

### Подсчёт числа вхождений каждого префикса

Здесь мы рассмотрим сразу две задачи. Дана строка $s$ длины $n$. В первом варианте требуется для каждого префикса $s[0 \ldots i]$ посчитать, сколько раз он встречается в самой же строке $s$. Во втором варианте задачи дана другая строка $t$, и требуется для каждого префикса $s[0 \ldots i]$ посчитать, сколько раз он встречается в $t$.

Решим сначала первую задачу. Рассмотрим в какой-либо позиции $i$ значение префикс-функции в ней $p[i]$. По определению, оно означает, что в позиции $i$ оканчивается вхождение префикса строки $s$ длины $p[i]$, и никакой больший префикс оканчиваться в позиции $i$ не может. В то же время, в позиции $i$ могло оканчиваться и вхождение префиксов меньших длин (и, очевидно, совсем не обязательно длины $p[i]-1$). Однако, как нетрудно заметить, мы пришли к тому же вопросу, на который мы уже отвечали при рассмотрении алгоритма вычисления префикс-функции: по данной длине $j$ надо сказать, какой наидлиннейший её собственный суффикс совпадает с её префиксом. Мы уже выяснили, что ответом на этот вопрос будет $p[j-1]$. Но тогда и в этой задаче, если в позиции $i$ оканчивается вхождение подстроки длины $p[i]$, совпадающей с префиксом, то в $i$ также оканчивается вхождение подстроки длины $p[p[i]-1]$, совпадающей с префиксом, а для неё применимы те же рассуждения, поэтому в $i$ также оканчивается и вхождение длины $p[p[p[i]-1]-1]$ и так далее (пока индекс не станет нулевым). Таким образом, для вычисления ответа мы должны выполнить такой цикл:

```cpp
vector<int> ans(n+1);
for (int i = 0; i < n; ++i)
    ++ans[pi[i]];
for (int i = n - 1; i > 0; --i)
    ans[pi[i - 1]] += ans[i];
```

Здесь мы для каждого значения префикс-функции сначала посчитали, сколько раз он встречался в массиве $p[]$, а затем посчитали такую в некотором роде динамику: если мы знаем, что префикс длины $i$ встречался ровно ${\rm ans}[i]$ раз, то именно такое количество надо прибавить к числу вхождений его длиннейшего собственного суффикса, совпадающего с его префиксом; затем уже из этого суффикса (конечно, меньшей чем $i$ длины) выполнится "пробрасывание" этого количества к своему суффиксу, и т.д.

Теперь рассмотрим вторую задачу. Применим стандартный приём: припишем к строке $s$ строку $t$ через разделитель, т.е. получим строку $s+\\#+t$, и посчитаем для неё префикс-функцию. Единственное отличие от первой задачи будет в том, что учитывать надо только те значения префикс-функции, которые относятся к строке $t$, т.е. все $p[i]$ для $i > n$.

## Автомат по префикс-функции

Вернёмся к уже неоднократно использованному приёму конкатенации двух строк через разделитель, т.е. для данных строк $s$ и $t$ вычисление префикс-функции для строки $s+\\#+t$. Очевидно, что т.к. символ $\\#$ является разделителем, то значение префикс-функции никогда не превысит $s.{\rm length}()$. Отсюда следует, что, как упоминалось при описании алгоритма вычисления префикс-функции, достаточно хранить только строку $s+\\#$ и значения префикс-функции для неё, а для всех последующих символов префикс-функцию вычислять на лету:

```latex
\underbrace{s_0\ s_1\ \ldots\ s_{n-1}\ \#}_{\text{нужно}} \underbrace{t_0\ t_1\ \ldots\ t_{m-1}\ \#}_{\text{не нужно}}
```

Действительно, в такой ситуации, зная очередной символ $c \in t$ и значение префикс-функции в предыдущей позиции, можно будет вычислить новое значение префикс-функции, никак при этом не используя все предыдущие символы строки $t$ и значения префикс-функции в них.

Другими словами, мы можем построить автомат: состоянием в нём будет текущее значение префикс-функции, переходы из одного состояния в другое будут осуществляться под действием символа:

```latex
s_0\ s_1\ \ldots\ s_{n-1}\ \# \underbrace{\ldots}_{p[i - 1]}\ \Ra\ 
s_0\ s_1\ \ldots\ s_{n-1}\ \# \underbrace{\ldots}_{p[i - 1]} + t_i\ \Ra\ 
s_0\ s_1\ \ldots\ s_{n-1}\ \# \ldots \underbrace{t_i}_{p[i]}
```

Таким образом, даже ещё не имея строки $t$, мы можем предварительно построить такую таблицу переходов $({\rm old}_p,c) \rightarrow {\rm new}_p$ с помощью того же алгоритма вычисления префикс-функции:

```cpp
string s; // входная строка
const int alphabet = 256; // мощность алфавита символов, обычно меньше

s += '#';
int n = (int) =s.length();
vector<int> pi = prefix_function(s);
vector<vector<int>> aut(n, vector<int> (alphabet));
for (int i = 0; i < n; ++i) {
    for (char c = 0; c < alphabet; ++c) {
        int j = i;
        while (j > 0 && c != s[j])
            j = pi[j-1];
        if (c == s[j])  ++j;
        aut[i][c] = j;
    }
}
```

Правда, в таком виде алгоритм будет работать за $\O(n^2 k)$ ($k$ — мощность алфавита). Но заметим, что вместо внутреннего цикла $\rm while$, который постепенно укорачивает ответ, мы можем воспользоваться уже вычисленной частью таблицы: переходя от значения $j$ к значению $p[j-1]$, мы фактически говорим, что переход из состояния $(j, c)$ приведёт в то же состояние, что и переход $(p[j-1], c)$, а для него ответ уже точно посчитан (т.к. $p[j-1] < j$):

```cpp
string s; // входная строка
const int alphabet = 256; // мощность алфавита символов, обычно меньше

s += '#';
int n = (int)s.length();
vector<int> pi = prefix_function(s);
vector<vector<int>> aut(n, vector<int> (alphabet));
for (int i = 0; i < n; ++i) {
    for (char c = 0; c < alphabet; ++c) {
        if (i > 0 && c != s[i])
            aut[i][c] = aut[pi[i-1]][c];
        else
            aut[i][c] = i + (c == s[i]);
    }
}
```

В итоге получилась крайне простая реализация построения автомата, работающая за $\O(n k)$.

Когда может быть полезен такой автомат? Для начала вспомним, что мы считаем префикс-функцию для строки $s+\\#+t$, и её значения обычно используют с единственной целью: найти все вхождения строки $s$ в строку $t$.

Поэтому самая очевидная польза от построения такого автомата — ускорение вычисления префикс-функции для строки $s+\\#+t$. Построив по строке $s+\\#$ автомат, нам уже больше не нужна ни строка $s$, ни значения префикс-функции в ней, не нужны и никакие вычисления — все переходы (т.е. то, как будет меняться префикс-функция) уже предпосчитаны в таблице.

Но есть и второе, менее очевидное применение. Это случай, когда строка $t$ является гигантской строкой, построенной по какому-либо правилу. Это может быть, например, строка Грея или строка, образованная рекурсивной комбинацией нескольких коротких строк, поданных на вход.

Пусть для определённости мы решаем такую задачу: дан номер $k \le 10^5$ строки Грея, и дана строка $s$ длины $n \le 10^5$. Требуется посчитать количество вхождений строки $s$ в $k$-ю строку Грея. Напомним, строки Грея определяются таким образом:

```latex
g_1 = a\\
g_2 = aba\\
g_3 = abacaba\\
g_4 = abacabadabacaba\\
\ldots
```

В таких случаях даже просто построение строки $t$ будет невозможным из-за её астрономической длины (например, $k$-ая строка Грея имеет длину $2^k-1$). Тем не менее, мы сможем посчитать значение префикс-функции на конце этой строки, зная значение префикс-функции, которое было перед началом этой строки.

Итак, помимо самого автомата также посчитаем такие величины: $G[i][j]$ — значение автомата, достигаемое после "скармливания" ему строки $g_i$, если до этого автомат находился в состоянии $j$. Вторая величина — $K[i][j]$ — количество вхождений строки $s$ в строку $g_i$, если до "скармливания" этой строки $g_i$ автомат находился в состоянии $j$. Фактически, $K[i][j]$ — это количество раз, которое автомат принимал значение $s.{\rm length}()$ за время "скармливания" строки $g_i$. Понятно, что ответом на задачу будет величина $K[k][0]$.

Как считать эти величины? Во-первых, базовыми значениями являются $G[0][j] = j$, $K[0][j] = 0$. А все последующие значения можно вычислять по предыдущим значениям и используя автомат. Итак, для вычисления этих значений для некоторого $i$ мы вспоминаем, что строка $g_i$ состоит из $g_{i-1}$ плюс $i$-ый символ алфавита плюс снова $g_{i-1}$. Тогда после "скармливания" первого куска $(g_{i-1})$ автомат перейдёт в состояние $G[i-1][j]$, затем после "скармливания" символа ${\rm char}_i$ он перейдёт в состояние:

```latex
{\rm mid} = {\rm aut}[\ G[i-1][j]\ ][{\rm char}_i]
```

После этого автомату "скармливается" последний кусок, т.е. $g_{i-1}$: $G[i][j] = G[i-1][{\rm mid}]$

Количества $K[i][j]$ легко считаются как сумма количеств по трём кускам $g_i$: строка $g_{i-1}$, символ ${\rm char}_i$, и снова строка $g_{i-1}$:

```latex
K[i][j] = K[i-1][j] + ({\rm mid} == s.{\rm length}) + K[i-1][mid]
```

Итак, мы решили задачу для строк Грея, аналогично можно решить целый класс таких задач. Например, точно таким же методом решается следующая задача: дана строка $s$, и образцы $t_i$, каждый из которых задаётся следующим образом: это строка из обычных символов, среди которых могут встречаться рекурсивные вставки других строк в форме $t_k[\rm cnt]$, которая означает, что в это место должно быть вставлено $\rm cnt$ экземпляров строки $t_k$. Пример такой схемы:

```latex
t_1 = abdeca\\
t_2 = abc + t_1[30] + abd\\
t_3 = t_2[50] + t_1[100]\\
t_4 = t_2[10] + t_3[100]
```

Гарантируется, что это описание не содержит в себе циклических зависимостей. Ограничения таковы, что если явным образом раскрывать рекурсию и находить строки $t_i$, то их длины могут достигать порядка $100^{100}$.

Требуется найти количество вхождений строки $s$ в каждую из строк $t_i$.

Задача решается так же, построением автомата префикс-функции, затем надо вычислять и добавлять в него переходы по целым строкам $t_i$. В общем-то, это просто более общий случай по сравнению с задачей о строках Грея.
