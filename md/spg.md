# Теория Шпрага-Гранди

Рассмотрим игру «ним»: даны $n$ кучек, в каждой из них по несколько камней. За один ход игрок может выбрать кучку и выбросить оттуда любое ненулевое число камней. Проигрыш наступпает, когда ходов больше не осталось, то есть когда все кучки пустые.

Немного переформулируем условие. Состояние нима однозначно описывается неупорядоченным набором неотрицательных чисел — как-нибудь пронумеруем их и обозначим количество камней в $i$-й как $a_i$. Теперь, за один ход разрешается строго уменьшить любое из чисел. Терминальное состояние — когда все числа стали нулями.

**Теорема.** Состояние игры выигрышное тогда и только тогда, когда xor-сумма $ S = a_1 \oplus a_2 \oplus \ldots \oplus a_n $ размеров кучек отлична от нуля.

**Доказательство** проведём по индукции. Для терминального состояния xor-сумма равна нулю, и оно действительно проигрышное — база доказана. Теперь докажем переходы:

* Из состояния с нулевой xor-суммой все переходы ведут в выигрышные состояния, то есть в состояния с ненулевой суммой. В самом деле, достаточно убрать сколько угодно спичек из любой кучки — xor сумма изменится с нуля на $a_i \oplus b_i $, где $b_i < a_i$ — это число камней в $i$-й кучке после нашего действия.
* Второй переход сложнее — нужно показать, что если xor-сумма ненулевая, то всегда существует такой $b_i < a_i$, что xor-сумма станет нулевой, то есть $S \oplus a_i \oplus b_i = 0$. Для этого посмотрим на старший взведенный бит $S$ и возьмем любой $a_i$, у которого этот бит тоже взведен. Такой $a_i$ найдётся хотя бы один — свойства ксора говорят, что их должно быть нечетное число. Из предыдущего равнства вытекает, что искомый $b_i$ равен $S \oplus a_i$, и выясняется, что это корректный новый размер кучки, то есть $b_i < a_i$. Почему так? Потому что все старшие биты в выражении остались нетронутыми, $k$-й бит изменился на единицу, а что происходило с дальнейшими битами нам не важно, потому что эти изменения точно не больше, чем $2^k$.

Автор любит конструктивные доказательства — из них сразу же вытекают алгоритмы, которые остается только реализовать. Получается, что оптимальная стратегия: посчитать xor-сумму всех $a_i$, найти такой $a_i$, у которого старший бит взведен, и заменить его на $S \oplus a_i$.

Каждый раз, перед тем, как рассказать про решение нима, автор просит кого-нибудь непосвященного сыграть против него в ним, и со скрежетом ксорит в уме несколько бинарных чисел, пока все не убедятся в верности теории.

**Зачем это надо?** Есть много игр, в которых присутствует какой-то подобный *цугцванг* (шахматный термин — когда у соперника кончились хорошие ходы, и он бы просто стоял на месте, но правила это запрещают). Выясняется, что они все эквивалентны ниму — их графы с точки зрения выигрышности суммы отдельных игр работают также, как графы нима. Но чтобы доказать это, нам потребуется немного получше разобраться в том, как ним устроен.

## Ним с увеличениями

Пусть у нас...

## Эквивалентность игр ниму

// TODO дописать это всё
