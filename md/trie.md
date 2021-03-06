# Бор и Алгоритм Ахо-Корасик

Пусть дан набор строк в алфавите размера $k$ суммарной длины $n$. Алгоритм Ахо-Корасик за $\O(nk)$ времени и памяти строит *префиксное дерево* для этого набора строк, а затем по этому дереву строит *автомат*, который может использоваться в различных строковых задачах — например, для нахождения всех вхождений каждой строки из данного набора в произвольный текст за линейное время.

Алгоритм открыт в 1975-м году и получил широкое распространение в системных программах для потоковой обработки текстов, например, в утилите [grep](https://en.wikipedia.org/wiki/Grep).

Автору этой статьи понадобилось по работе реализовать алгоритм Ахо-Корасик целых два раза, что на два раза больше, чем все остальные «олимпиадные» алгоритмы.

## Префиксное дерево

*Префиксное дерево* или *бор* (англ. *trie*) — это структура данных для компактного хранения строк. Она устроена в виде дерева, где на рёбрах между вершинами написана символы, а некоторые вершины помечены *терминальными*.

![](img/SwiftAlgClub_TrieData-trie-1.png)

Говорят, что бор *принимает* строку $s$, если существует такая вершина $v$, что, если выписать подряд все буквы на путях от корня до $v$, то получится строка $s$.

Бор сам по себе можно использовать для разных задач:

- Хранение строк — бор может занимать гораздо меньше места, чем массив или `set` строк.

- Сортировка строк — по бору можно пройтись dfs-ом и вывести все строки в лексикографическом порядке.

- Просто множество строк — как мы увидим, в него легко добавлять и удалять слова, а также проверять, есть ли слово в боре.

### Реализация

Бор состоит из ссылающихся друг на друга вершин. В вершине обычно хранится следующая информация:

- терминальная ли вершина,
- ссылки на детей,
- возможно, какая-нибудь дополнительная зависящая от задачи информация о слове. Например, количество таких слов, заканчивающихся в вершине — так можно реализовать мультисет.

```cpp
const int k = 26;

struct Vertex {
    Vertex* to[k] = {0};
    bool terminal = 0;
};

Vertex *root = new Vertex();
```

Чтобы добавить слово в бор, нужно пройтись от корня по символам слова. Если перехода по для очередного символа нет — создать его, иначе пройти по уже существующему переходу. Последнюю вершину нужно пометить терминальной.

```cpp
void add_string(string &s) {
    v = root;
    for (char c : s) {
        c -= 'a';
        if (!v->to[c]) 
            v->to[c] = new Vertex();
        v = v->to[c];
    }
    v->terminal = true;
}
```

Чтобы проверить, есть ли слово в боре, нужно так же пройти от корня по символам слова. Если в конце оказались в терминальной вершине — то слово есть. Если оказались в нетерминальной вершине или когда-нибудь потребовалось пройтись по несуществущей ссылке — то нет.

Удалить слово можно «лениво»: просто дойти до него и убрать флаг терминальности.

### Как хранить ссылки

Хранить ссылки на детей не обязательно в массиве. Возможно, наш алфавит большой — тогда нам просто не хватит памяти инициализировать столько массивов, большинство из которых будут пустыми.

В этом случае можно придумать какой-нибудь другой способ хранить отображение из символа в ссылку. Например, хранить существующие ссылки в бинарном дереве (`map`), хэш-таблице (`unordered_map`) или просто в векторе. Они будут работать дольше, но зато потребление памяти в них будет линейным.

## Суффиксные ссылки

Вернёмся к основной теме статьи.

Пусть дан набор строк $s_1, s_2, \ldots, s_n$, называемый *cловарём* и большой текст $t$. Необходимо найти все позиции, где строки словаря входят в текст. Для простоты дополнительно предположим, что строки из словаря не являются подстроками друг друга (позже мы увидим, что это требование избыточно).

Решать эту задачу будем следующим образом. Будем обрабатывать символы текста по одному и поддерживать наибольшую строку, являющуюся префиксом строки из словаря, и при этом также суффиксом считанного на данный момент текста. Если эта строка совпадает с каким-то $s_i$, то отметим текущий символ — в нём заканчивается какая-то строка из словаря.

Для этой задачи нам нужно как-то эффективно хранить и работать со всеми префиксами слов из словаря — для этого нам и понадобится префиксное дерево.

Добавим все слова в префиксное дерево и пометим соответствующие им вершины как терминальные. Теперь наша задача состоит в том, чтобы при добавлении очередного символа быстро находить вершину в префиксном дереве, которая соответcтвует наидленнейшему входящему в бор суффиксу нового выписанного префикса. Для этого нам понадобятся несколько вспомогательных понятий.

**Анти-формализм.** Чтобы не писать везде громоздкое «строка $s$, которая соответствуют вершине $v$», условимся дальше отождествлять вершину и соответствующую ей строку в боре.

**Определение.** *Суффиксная ссылка* $l(v)$ ведёт в вершину $u \neq v$, которая соответствует наидлиннейшему принемаемому бором суффиксу $v$.

**Определение.** *Автоматный переход* $\delta(v, c)$ ведёт в вершину, соответствующую минимальному принемаемому бором суффиксу строки $v + c$. Если переход и так существует в боре, то автоматный переход будет вести туда же.

Автоматные переходы — это именно то, что нам и надо в задаче: они ведут ровно в те вершины, которые соответствуют самому длинному «сматченному» суффиксу.

Заметим следующую связь суффиксных ссылок и автоматных переходов:

- $l(s_{:n}) = \delta(l(s_{:n-1}), s_n)$.

- Если прямого перехода $v \to_c u$ не существует, то $\delta(v, c) = \delta(l(v), c)$.

Мы только что выразили $l$ и $\delta$ от строки длины $n$ через $l$ и $\delta$ от строк размера $(n-1)$. Значит, суффиксные ссылки и автоматные переходы можно найти динамическим программированием.

### Реализация

По сравнению с префиксным деревом, нам помимо массива переходов в боре `to` нужно будет хранить некоторую дополнительную информацию:

* Сам массив автоматных переходов размера `go`.

* Суффиксную ссылку `link`.

* «Родительский» (последний) символ `pch`, который используется в формуле для суффиксной ссылки.

```cpp
const int k = 26;

struct Vertex {
    Vertex *to[k] = {0}, *go[k] = {0};
    Vertex *link = 0, *p;
    int pch;
    Vertex (int _pch, Vertex *_p) { pch = _pch, p = _p; }
};

Vertex *root = new Vertex(-1, 0);
```

Добавление строки почти такое же:

```cpp
void add_string(string &s) {
    Vertex *v = root;
    for (char _c : s) {
        int c -= int(_c - 'a');
        if (!v->to[c])
            v->to[c] = new Vertex(c, v);
        v = v->to[c];
    }
}
```

Подсчитывать динамики `go` и `link` будем «лениво» — введем для них две функции, которые будут мемоизировать свой результат выполнения.

```cpp
// нам нужно объявить две функции, ссылающиеся друг на друга
// в C++ для этого нужно одну из них объявить только с сигнатурой перед другой
Vertex* go(Vertex *v, int c);

Vertex* link(Vertex *v) {
    if (!v->link) {
        // для строк длины меньше двух суффиксная ссылка это корень
        if (v == root || v->p == root)
            v->link = root;
        else // для остальных случаев формула работает
            v->link = go(link(v->p), v->pch);
    }
    return v->link;
}

Vertex* go(Vertex *v, int c) {
    if (!v->go[c]) {
        // если переход есть, то автоматный должен вести туда же
        if (v->to[c])
            v->go[c] = v->to[c];
        // если перехода нет из корня, то нужно сделать петлю
        else if (v == root)
            v->go[c] = root;
        else // для остальных случаев формула работает
            v->go[c] = go(link(v), c);
    }
    return v->go[c];
}
```

На самом деле, эффективнее и «чище» реализовывать построение автомата через bfs, но так получается немного сложнее для понимания.

## Код

```cpp
// Цифровой бор для двоичной системы счисления.
// Позволяет найти максимальный XOR
struct trie {
  struct trie_v {
    int to[2] = {0};
    int term = 0;
    int full_term = 0;
  };
  vector<trie_v> vs;
  int cur = 0;

  trie() { vs.resize(4179000); }

  void add(int s) {
    int i = 0;
    int bit_idx = 30;
    while (bit_idx >= 0) {
      int b = (s >> bit_idx) & 1;
      if (!vs[i].to[b]) {
        vs[i].to[b] = ++cur;
      }
      ++vs[i].full_term;
      i = vs[i].to[b];
      --bit_idx;
    }
    ++vs[i].full_term;
    ++vs[i].term;
  }

  // Элемент должен существовать
  void del(int s) {
    int i = 0;
    int bit_idx = 30;
    while (bit_idx >= 0) {
      int b = (s >> bit_idx) & 1;
      if (!vs[i].to[b]) {
        return;
      }
      --vs[i].full_term;
      i = vs[i].to[b];
      --bit_idx;
    }
    --vs[i].full_term;
    --vs[i].term;
  }

  int get_xor(int s) {
    int i = 0;
    int bit_idx = 30;
    int r = 0;
    while (bit_idx >= 0) {
      int b = (s >> bit_idx) & 1;
      r <<= 1;
      if (vs[i].to[b ^ 1] && vs[vs[i].to[b ^ 1]].full_term) {
        i = vs[i].to[b ^ 1];
        r |= 1;
      } else if (vs[i].to[b] && vs[vs[i].to[b]].full_term) {
        i = vs[i].to[b];
      } else {
        // что за бред(
        return -1;
      }
      --bit_idx;
    }
    return r;
  }
};
```
<br>

```cpp
// Бор для строк.
// Позволяет найти лексикографически минимальную строку
struct trie {
  struct trie_v {
    int to[26] = {0};
    int term = 0;
    int full_term = 0;
  };
  vector<trie_v> vs;
  int cur = 0;

  trie() { vs.resize(1000179); }

  void add(const string& s) {
    int i = 0;
    for (char c : s) {
      c -= 'a';
      if (!vs[i].to[c]) {
        vs[i].to[c] = ++cur;
      }
      ++vs[i].full_term;
      i = vs[i].to[c];
    }
    ++vs[i].full_term;
    ++vs[i].term;
  }

  int find(const string& s) {
    int i = 0;
    for (char c : s) {
      c -= 'a';
      if (!vs[i].to[c]) {
        return 0;
      }
      i = vs[i].to[c];
    }
    return vs[i].term;
  }

  // should exist.
  void del(const string& s) {
    int i = 0;
    for (char c : s) {
      c -= 'a';
      if (!vs[i].to[c]) {
        return;
      }
      --vs[i].full_term;
      i = vs[i].to[c];
    }
    --vs[i].full_term;
    --vs[i].term;
  }

  pair<bool, string> start() {
    string res;
    int i = 0;
    while (!vs[i].term) {
      int c = 0;
      while (c < 26 && (!vs[i].to[c] || !vs[vs[i].to[c]].full_term)) {
        ++c;
      }
      if (c == 26) {
        return {0, ""};
      }
      res += (char)(c + 'a');
      i = vs[i].to[c];
    }
    return {1, res};
  }
};
```
<br>

```cpp
// Ахо-Корасик. Реализация по Википедии на указателях
class BorNode;

// Следующий класс может быть целесообразно поместить внутрь автомата среди
// приватных полей.
class BorNode {
public:
  map<const char, BorNode*> links;
  BorNode* fail;  // Предыдущее состояние для функции отката. Только для root
                  // равно NULL.
  BorNode* term;  // Ближайшее терминальное состояние. Если отстутствует - NULL
  vector<int> out;

public:
  BorNode(BorNode* fail_node = NULL) : fail(fail_node), term(NULL), out(0) {}

  BorNode* getLink(const char c) const {
    map<const char, BorNode*>::const_iterator iter = links.find(c);
    if (iter != links.cend()) {
      return iter->second;
    } else {
      return NULL;
    }
  }

  bool isTerminal() const { return (out.size() > 0); }
};

class AhoCorasick {
public:
  typedef void (*Callback)(int p, int x);
  BorNode root;
  vector<string> words;
  BorNode* current_state;

public:
  void addString(const char* const str) {
    BorNode* current_node = &root;
    for (const char* cp = str; *cp; ++cp) {
      BorNode* child_node = current_node->getLink(*cp);
      if (!child_node) {
        child_node = new BorNode(&root);
        current_node->links[*cp] = child_node;
      }
      current_node = child_node;
    }
    current_node->out.push_back(words.size());
    words.push_back(str);
  }

  void init() {
    queue<BorNode*> q;
    q.push(&root);
    while (!q.empty()) {
      BorNode* current_node = q.front();
      q.pop();
      for (map<const char, BorNode*>::const_iterator iter =
               current_node->links.cbegin();
           iter != current_node->links.cend(); ++iter) {
        const char symbol = iter->first;
        BorNode* child = iter->second;

        // Defining .fail for the childnode
        BorNode* temp_node = current_node->fail;
        while (temp_node) {
          BorNode* fail_candidate = temp_node->getLink(symbol);
          if (fail_candidate) {
            child->fail = fail_candidate;
            break;
          }
          temp_node = temp_node->fail;
        }

        // Defining .term for the childnode using .term of current node
        if (child->fail->isTerminal()) {
          child->term = child->fail;
        } else {
          child->term = child->fail->term;
        }
        q.push(child);
      }
    }
  }

  void step(const char c) {
    while (current_state) {
      BorNode* candidate = current_state->getLink(c);
      if (candidate) {
        current_state = candidate;
        return;
      }
      current_state = current_state->fail;
    }
    current_state = &root;
  }

  void printTermsForCurrentState(Callback callback, int i) const {
    if (current_state->isTerminal()) {
      for_each(all(current_state->out),
               [&](int x) { callback(i - words[x].size(), x); });
    }
    BorNode* temp_node = current_state->term;
    while (temp_node) {
      for_each(all(temp_node->out),
               [&](int x) { callback(i - words[x].size(), x); });
      temp_node = temp_node->term;
    }
  }

  void search(const char* str, Callback callback) {
    current_state = &root;
    int i = 0;
    for (; *str; ++str) {
      step(*str);
      printTermsForCurrentState(callback, ++i);
    }
  }
};

// Применение: задача на строки
// Дана строка X и N строк-ключей Fi
// для каждой строки Fi вывести сколько раз встречается и где начинается
// TL 2s, ML 256M
// N <= 1M, len(X) <= 1M
vector<set<int>> term;
void add_to_term(int p, int i) {
  term[i].insert(p);
}

int main() {
  use_fast_io;
  string s;
  cin >> s;
  s += '.';
  int n;
  cin >> n;
  term.resize(n);
  AhoCorasick ak;

  for (int i = 0; i < n; ++i) {
    string t;
    cin >> t;
    ak.addString(t.c_str());
  }

  ak.init();
  ak.search(s.c_str(), add_to_term);

  for (int i = 0; i < n; ++i) {
    vector<int> tmp(all(term[i]));
    cout << tmp.size();
    for (int k = 0; k < tmp.size(); ++k) {
      cout << " " << tmp[k] + 1;
    }
    cout << endl;
  }

  return 0;
}
```
