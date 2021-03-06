# Обратный элемент по модулю

Часто в задачах требуется посчитать что-то по простому модулю (чаще всего $10^9 + 7$). Это делают для того, чтобы участникам не приходилось использовать длинную арифметику, и они могли сосредоточиться на самой задаче.

Обычные арифметические операции выполняются не сильно сложнее — просто нужно брать модули и заботиться о переполнении. Например:

```cpp
c = (a + b) % mod;
c = (mod + a - b) % mod;
c = a * b % mod;
```

Но вот с делением возникают проблемы — мы не можем просто взять и поделить. Пример: $\frac{8}{2} = 4$, но $\frac{8 \% 5 = 3}{2 \% 5 = 2} \neq 4$.

Нужно найти некоторый элемент, который будет себя вести как $\frac{1}{a} = a^{-1}$, и вместо «деления» домножать на него. Назовем такой элемент обратным.

## Способ 1: бинарное возведение в степень

Если модуль $p$ простой, то решением будет $a^{-1} \equiv a^{p-2}$. Это следует из малой теоремы Ферма:

**Теорема.** $a^p \equiv a \pmod p$ для всех $a$, не делящихся на $p$.

**Доказательство**. (для понимания несущественно, можно пропустить)

```latex
\begin{aligned}a^p &= (\underbrace{1+1+\ldots+1+1}_{a\text{ раз}})^p &\quad \\\\ &= \sum_{x_1+x_2+\ldots+x_a = p} P(x_1, x_2, \ldots, x_a) & \text{(раскладываем по определению)} \\\\ &= \sum_{x_1+x_2+\ldots+x_a = p} \frac{p!}{x_1! x_2! \ldots x_a!} & {\text{(какие слагаемые не делятся на }p\text{?})} \\\\ &\equiv P(p, 0, \ldots, 0) + \ldots + P(0, 0, \ldots, p) & \text{(все остальные не убьют }p\text{ в знаменателе)} \\\\ &= a &\quad \end{aligned}
```

Здесь $P(x_1, x_2, \ldots, x_n) = \frac{k}{\prod (x_i!)}$ это мультиномиальный коеффициент — количество раз, которое элемент $a_1^{x_1} a_2^{x_2} \ldots a_n^{x_n}$ появится при раскрытии скобки $(a_1 + a_2 + \ldots + a_n)^k$.

Теперь два раза «поделим» наш результат на $a$.

$$ a^p \equiv a \implies a^{p-1} \equiv 1 \implies a^{p-2} \equiv a^{-1} $$

Получается, что $a^{p-2}$ ведет себя как $a^{-1}$, что нам по сути и нужно.
Посчитать $a^{p-2}$ можно за $O(\log p)$ бинарным возведением в степень.

Приведем код, который позволяет считает $C_n^k$.

```cpp
int t[maxn]; // факториалы, можно предподситать простым циклом

// бинарное возведение в степень
int bp(int a, int n) {
    int res = 1;
    while (n) {
        if (n & 1) res = res * a % mod;
        a = a * a % mod;
        n >>= 1;
    }
    return res;
}

// находит обратный элемент как a^(p-2)
int inv(int x) {
    return bp(x, mod-2);
}

int c(int n, int k) {
    return t[n] * inv(t[k]) % mod * inv(t[n-k]) % mod;
}
```

## Способ 2: диофантово уравнение

Диофантовыми уравнениями называют такие штуки:

$$ ax + by = 1 $$

Требуется решить их в целых числах, то есть $a$ и $b$ известны, и нужно найти такие целые (возможно, отрицательные) $x$ и $y$, чтобы равенство выполнялось. Решают такие вещи расширенным алгоритмом Евклида. **TODO: описать, как он работает.**

Подставим в качестве $a$ и $b$ соответственно $a$ и $m$

$$ ax + my = 1 $$

Одним из решений уравнения и будет $a^{-1}$, потому что если взять уравнение по модулю $m$, то получим

$$ ax + by = 1 \iff ax \equiv 1 \iff x \equiv a^{-1} \pmod m $$

Преимущества этого метода над возведением в степень:

* Если обратное существует, то оно найдется даже если модуль не простой. Способ с бинарным возведением тоже можно заставить работать с произвольным модулем, но это будет намного труднее. 
* Алгоритм проще выполнять руками.

Сам автор почти всегда использует возведение в степень.

```cpp
// ExtGCD + Inv
long long egcd(long long a, long long b, long long& x, long long& y) {
  if (a == 0) {
    x = 0;
    y = 1;
    return b;
  }
  long long x1, y1;
  long long d = egcd(b % a, a, x1, y1);
  x = y1 - (b / a) * x1;
  y = x1;
  return d;
}

long long invmod(long long a, long long m) {
  long long x, y;
  long long r = egcd(a, m, x, y);
  if (r == 1) return -1;   // НЕ существует обратного элемента
  return (x % m + m) % m;  // Надо обходить отрицательные числа
}

```

### Почему $10^9+7$?

1. Это выражение довольно легко вбивать (`1e9+7`).
2. Простое число.
3. Достаточно большое.
4. `int` не переполняется при сложении.
5. `long long` не переполняется при умножении.

Кстати, $10^9 + 9$ обладает теми же свойствами. Иногда используют и его.

## Предподсчёт обратных факториалов за линейное время

Пусть нам нужно зачем-то посчитать все те же $C_n^k$, но для больших $n$ и $k$, поэтому асимптотика $\O(n \log m)$ нас не устроит. Оказывается, мы можем сразу предподсчитать все обратные ко всем факториалам.

Если у нас уже написан `inv`, то нам не жалко потратить $\O(\log m)$ операций, посчитав $m!^{-1}$.

После этого мы будем считать $(m-1)!^{-1}$ как $m!^{-1} m = \frac{1}{1 \cdot 2 \cdot \ldots \cdot (m-1)}$.

```cpp
int f[maxn];
f[0] = 1;
for (int i = 1; i < maxn; i++)
    f[i] = i*f[i-1] % mod;

int r[maxn];
r[maxn-1] = inv(f[maxn-1])
for (int i = maxn-1; i >= 1; i--)
    r[i-1] = r[i]*i % mod;
```

TODO: техника с сайта емакса.
