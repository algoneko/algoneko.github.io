# sqrt-дерево

Это -- перевод [статьи про sqrt-дерево](https://cp-algorithms.com/data_structures/sqrt-tree.html) из английского e-maxx.

Перед прочтением рекомендуется ознакомиться с базовыми принципами [корневой декомпозиции](sqrt.html).

Дан массив ~a~ из ~n~ элементов и ассоциативная операция $\circ$: $(x \circ y) \circ z = x \circ (y \circ z) \forall x, y, z$.

Такими операциями являются, к примеру, $\gcd$, $\min$, $\max$, $+$, $\text{and}$, $\text{or}$, $\text{xor}$.

Также, даны запросы $q(l, r)$. Для каждого запроса необходимо посчитать $a_l \circ a_{l+1} \circ \dots \circ a_r$.

sqrt-дерево может отвечать на такие запросы за $\O(1)$ с препроцессингом за $\O(n\log\log n)$ времени и затратами в $\O(n\log\log n)$ памяти.

## Описание
### Построение корневой декомпозиции

Построим [корневую декомпозицию](sqrt.html). Разделим массив на ~sqrt(n)~ блоков, каждый размером ~sqrt(n)~. Для каждого блока посчитаем:

1. Ответы на запросы, которые полностью лежат в данном блоке и начинаются в начале блока ($\text{prefixOp}$)
2. Ответы на запросы, которые полностью лежат в данном блоке и заканчиваются в конце блока ($\text{suffixOp}$)

Также рассчитаем следующий массив:

3. $\text{between}_{i, j}$ (для $i \le j$) -- ответ на запрос который начинается в начале блока $i$ и заканчивается в конце блока $j$. Поскольку у нас ~sqrt(n)~ блоков, размер этого массива будет $\O\left( \left(\sqrt{n}\right)^2 \right) = \O(n)$.

Рассмотрим пример.

Пусть $\circ$ -- это $+$, то есть у нас запросы суммы на отрезке и дан следующий массив $a$: `{1, 2, 3, 4, 5, 6, 7, 8, 9}`

Он будет разделен на 3 блока: `{1, 2, 3}`, `{4, 5, 6}` и `{7, 8, 9}`.

Для 1 блока $\text{prefixOp}$ равен `{1, 3, 6}` и $\text{suffixOp}$ равен `{6, 5, 3}`.

Для 2 блока $\text{prefixOp}$ равен `{4, 9, 15}` и $\text{suffixOp}$ равен `{15, 11, 6}`.

Для 3 блока $\text{prefixOp}$ равен `{7, 15, 24}` и $\text{suffixOp}$ равен `{24, 17, 9}`.

Массив $\text{between}$:

```
{{6, 21, 45},
 {0, 15, 39},
 {0, 0,  24}}
```

(элементы, для которых $i > j$ заполнены нулями)

Очевидно, что эти массивы можно легко посчитать за $\O(n)$ времени и $\O(n)$ памяти.

На некоторые запросы ответить можно прямо сейчас. Если запрос не находится целиком в одном блоке, то кго можно разделить на три части: суффикс какого-то блока (он же левый obroobock), отрезок последовательных блоков и префикс какого-то блока (он же правый obroobock). Тогда ответом на запрос будет объединение значения из $\text{suffixOp}$, задем значения из $\text{between}$ и потом значения из $\text{prefixOp}$.

Но если есть запросы, которые полностью лежат в одном блоке, то с помощью этих массивов их нельзя обработать. Необходимо что-то придумать (Если операция отменяемая, то можно сделать для каждого блока массив $\text{undo}$: отмена операции на суффиксе. Тогда ответом на запрос будет $\text{suffixOp}(i) \circ \text{undo}(j+1)$).

### Делаем дерево

Нельзя ответить _только_ на запросы, которые ледат полностью в одном блоке. Что, если **построить sqrt-дерево в каждом блоке**? Так делать можно. И если делать это рекурсивно, пока размер блока не будет равен 1 или 2. Для таких блоков ответ на запрос можно легко посчитать за $\O(1)$.

Итак, у нас есть дерево. Каждая вершина дерева отображает какой-то подотресок массива. У вершины с подотрезком длины $k$ будет ~sqrt(k)~ детей -- на каждый блок. Также каждая вершина содержит три описанных ранее массива для своего отрезка. Корень дерева отображает весь массив. Листьями являются вершины с отрезками длины 1 или 2.

Также очевидно, что высота этого дерева $\O(\log\log n)$, поскольку если какая-то вершина отображает отрезок длины $k$, то длина отрезков ее детей ~sqrt(k)~. ~log(sqrt(k)) = (log(k)) / 2~, то есть $\log k$ с каждым уровнем уменьшается в два раза, а тогда высота дерева равна $\O(\log\log n)$. Время на построение и использование памяти будут $\O(n\log\log n)$, так как каждый элемент на каждом уровне встречается только один раз.

Теперь на запросы можно отвечать за $\O(\log\log n)$: идем вниз по дереву, пока не наткнемся на отрезок длины 1 или 2 или не встретим первый отрезок, на котором запрос не помещается весь в один блок. Как отвечать на запрос в таком случае было объяснено ранее.

Хорошо, мы научились отвечать на запросы за $\O(\log\log n)$. Можно еще быстрее?

### Оптимизации ответа на запрос

Одна из наиболее очевидных оптимизаций -- двоичным поиском найти вершину дерева, котррая будет нужна. Используя двоичный поиск можно добиться асимптотики $\O(log\log\log n)$ на запрос. Можно ли _еще_ быстрее?

Да, можно. Давайте сделаем следующие предположения:

1. Размер каждого блока -- степень двойки.
2. На каждом уровне все блоки имеют одинаковый размер.

To reach this, we can add some zero elements to our array so that its size becomes a power of two.

When we use this, some block sizes may become twice larger to be a power of two, but it still be $O(\sqrt{k})$ in size and we keep linear complexity for building the arrays in a segment.

Now, we can easily check if the query fits entirely into a block with size $2^k$. Let's write the ranges of the query, $l$ and $r$ (we use 0-indexation) in binary form. For instance, let's assume $k=4, l=39, r=46$. The binary representation of $l$ and $r$ is:

$l = 39_{10} = 100111_2$

$r = 46_{10} = 101110_2$

Remember that one layer contains segments of the equal size, and the block on one layer have also equal size (in our case, their size is $2^k = 2^4 = 16$. The blocks cover the array entirely, so the first block covers elements $(0 - 15)$ ($(000000_2 - 001111_2)$ in binary), the second one covers elements $(16 - 31)$ ($(010000_2 - 011111_2)$ in binary) and so on. We see that the indices of the positions covered by one block may differ only in $k$ (in our case, $4$) last bits. In our case $l$ and $r$ have equal bits except four lowest, so they lie in one block.

So, we need to check if nothing more that $k$ smallest bits differ (or $l\ \text{xor}\ r$ doesn't exceed $2^k-1$).

Using this observation, we can find a layer that is suitable to answer the query quickly. How to do this:

1. For each $i$ that doesn't exceed the array size, we find the highest bit that is equal to $1$. To do this quickly, we use DP and a precalculated array.

2. Now, for each $q(l, r)$ we find the highest bit of $l\ \text{xor}\ r$ and, using this information, it's easy to choose the layer on which we can process the query easily. We can also use a precalculated array here.

For more details, see the code below.

So, using this, we can answer the queries in $O(1)$ each. Hooray! :)

## Updating elements

We can also update elements in Sqrt Tree. Both single element updates and updates on a segment are supported.

### Updating a single element

Consider a query $\text{update}(x, val)$ that does the assignment $a_x = val$. We need to perform this query fast enough.

#### Naive approach

First, let's take a look of what is changed in the tree when a single element changes. Consider a tree node with length $l$ and its arrays: $\text{prefixOp}$, $\text{suffixOp}$ and $\text{between}$. It is easy to see that only $O(\sqrt{l})$ elements from $\text{prefixOp}$ and $\text{suffixOp}$ change (only inside the block with the changed element). $O(l)$ elements are changed in $\text{between}$. Therefore, $O(l)$ elements in the tree node are updated.

We remember that any element $x$ is present in exactly one tree node at each layer. Root node (layer $0$) has length $O(n)$, nodes on layer $1$ have length $O(\sqrt{n})$, nodes on layer $2$ have length $O(\sqrt{\sqrt{n}})$, etc. So the time complexity per update is $O(n + \sqrt{n} + \sqrt{\sqrt{n}} + \dots) = O(n)$.

But it's too slow. Can it be done faster?

#### An sqrt-tree inside the sqrt-tree

Note that the bottleneck of updating is rebuilding $\text{between}$ of the root node. To optimize the tree, let's get rid of this array! Instead of $\text{between}$ array, we store another sqrt-tree for the root node. Let's call it $\text{index}$. It plays the same role as $\text{between}$&mdash; answers the queries on segments of blocks. Note that the rest of the tree nodes don't have $\text{index}$, they keep their $\text{between}$ arrays.

A sqrt-tree is _indexed_, if its root node has $\text{index}$. A sqrt-tree with $\text{between}$ array in its root node is _unindexed_. Note that $\text{index}$ **is _unindexed_ itself**.

So, we have the following algorithm for updating an _indexed_ tree:

* Update $\text{prefixOp}$ and $\text{suffixOp}$ in $O(\sqrt{n})$.

* Update $\text{index}$. It has length $O(\sqrt{n})$ and we need to update only one item in it (that represents the changed block). So, the time complexity for this step is $O(\sqrt{n})$. We can use the algorithm described in the beginning of this section (the "slow" one) to do it.

* Go into the child node that represents the changed block and update it in $O(\sqrt{n})$ with the "slow" algorithm.

Note that the query complexity is still $O(1)$: we need to use $\text{index}$ in query no more than once, and this will take $O(1)$ time.

So, total time complexity for updating a single element is $O(\sqrt{n})$. Hooray! :)

### Updating a segment

Sqrt-tree also can do things like assigning an element on a segment. $\text{massUpdate}(x, l, r)$ means $a_i = x$ for all $l \le i \le r$.

There are two approaches to do this: one of them does $\text{massUpdate}$ in $O(\sqrt{n}\cdot \log \log n)$, keeping $O(1)$ per query. The second one does $\text{massUpdate}$ in $O(\sqrt{n})$, but the query complexity becomes $O(\log \log n)$.

We will do lazy propagation in the same way as it is done in segment trees: we mark some nodes as _lazy_, meaning that we'll push them when it's necessary. But one thing is different from segment trees: pushing a node is expensive, so it cannot be done in queries. On the layer $0$, pushing a node takes $O(\sqrt{n})$ time. So, we don't push nodes inside queries, we only look if the current node or its parent are _lazy_, and just take it into account while performing queries.

#### First approach

In the first approach, we say that only nodes on layer $1$ (with length $O(\sqrt{n}$) can be _lazy_. When pushing such node, it updates all its subtree including itself in $O(\sqrt{n}\cdot \log \log n)$. The $\text{massUpdate}$ process is done as follows:

* Consider the nodes on layer $1$ and blocks corresponding to them.

* Some blocks are entirely covered by $\text{massUpdate}$. Mark them as _lazy_ in $O(\sqrt{n})$.

* Some blocks are partially covered. Note there are no more than two blocks of this kind. Rebuild them in $O(\sqrt{n}\cdot \log \log n)$. If they were _lazy_, take it into account.

* Update $\text{prefixOp}$ and $\text{suffixOp}$ for partially covered blocks in $O(\sqrt{n})$ (because there are only two such blocks).

* Rebuild the $\text{index}$ in $O(\sqrt{n}\cdot \log \log n)$.

So we can do $\text{massUpdate}$ fast. But how lazy propagation affects queries? They will have the following modifications:

* If our query entirely lies in a _lazy_ block, calculate it and take _lazy_ into account. $O(1)$.

* If our query consists of many blocks, some of which are _lazy_, we need to take care of _lazy_ only on the leftmost and the rightmost block. The rest of the blocks are calculated using $\text{index}$, which already knows the answer on _lazy_ block (because it's rebuilt after each modification). $O(1)$.

The query complexity still remains $O(1)$.

#### Second approach

In this approach, each node can be _lazy_ (except root). Even nodes in $\text{index}$ can be _lazy_. So, while processing a query, we have to look for _lazy_ tags in all the parent nodes, i. e. query complexity will be $O(\log \log n)$.

But $\text{massUpdate}$ becomes faster. It looks in the following way:

* Some blocks are fully covered with $\text{massUpdate}$. So, _lazy_ tags are added to them. It is $O(\sqrt{n})$.

* Update $\text{prefixOp}$ and $\text{suffixOp}$ for partially covered blocks in $O(\sqrt{n})$ (because there are only two such blocks).

* Do not forget to update the index. It is $O(\sqrt{n})$ (we use the same $\text{massUpdate}$ algorithm).

* Update $\text{between}$ array for _unindexed_ subtrees. 

* Go into the nodes representing partially covered blocks and call $\text{massUpdate}$ recursively.

Note that when we do the recursive call, we do prefix or suffix $\text{massUpdate}$. But for prefix and suffix updates we can have no more than one partially covered child. So, we visit one node on layer $1$, two nodes on layer $2$ and two nodes on any deeper level. So, the time complexity is $O(\sqrt{n} + \sqrt{\sqrt{n}} + \dots) = O(\sqrt{n})$. The approach here is similar to the segment tree mass update.

## Implementation

The following implementation of Sqrt Tree can perform the following operations: build in $O(n \cdot \log \log n)$, answer queries in $O(1)$ and update an element in $O(\sqrt{n})$.

~~~~~cpp
SqrtTreeItem op(const SqrtTreeItem &a, const SqrtTreeItem &b);

inline int log2Up(int n) {
	int res = 0;
	while ((1 << res) < n) {
		res++;
	}
	return res;
}

class SqrtTree {
private:
	int n, lg, indexSz;
	vector<SqrtTreeItem> v;
	vector<int> clz, layers, onLayer;
	vector< vector<SqrtTreeItem> > pref, suf, between;
	
	inline void buildBlock(int layer, int l, int r) {
		pref[layer][l] = v[l];
		for (int i = l+1; i < r; i++) {
			pref[layer][i] = op(pref[layer][i-1], v[i]);
		}
		suf[layer][r-1] = v[r-1];
		for (int i = r-2; i >= l; i--) {
			suf[layer][i] = op(v[i], suf[layer][i+1]);
		}
	}
	
	inline void buildBetween(int layer, int lBound, int rBound, int betweenOffs) {
		int bSzLog = (layers[layer]+1) >> 1;
		int bCntLog = layers[layer] >> 1;
		int bSz = 1 << bSzLog;
		int bCnt = (rBound - lBound + bSz - 1) >> bSzLog;
		for (int i = 0; i < bCnt; i++) {
			SqrtTreeItem ans;
			for (int j = i; j < bCnt; j++) {
				SqrtTreeItem add = suf[layer][lBound + (j << bSzLog)];
				ans = (i == j) ? add : op(ans, add);
				between[layer-1][betweenOffs + lBound + (i << bCntLog) + j] = ans;
			}
		}
	}
	
	inline void buildBetweenZero() {
		int bSzLog = (lg+1) >> 1;
		for (int i = 0; i < indexSz; i++) {
			v[n+i] = suf[0][i << bSzLog];
		}
		build(1, n, n + indexSz, (1 << lg) - n);
	}
	
	inline void updateBetweenZero(int bid) {
		int bSzLog = (lg+1) >> 1;
		v[n+bid] = suf[0][bid << bSzLog];
		update(1, n, n + indexSz, (1 << lg) - n, n+bid);
	}
	
	void build(int layer, int lBound, int rBound, int betweenOffs) {
		if (layer >= (int)layers.size()) {
			return;
		}
		int bSz = 1 << ((layers[layer]+1) >> 1);
		for (int l = lBound; l < rBound; l += bSz) {
			int r = min(l + bSz, rBound);
			buildBlock(layer, l, r);
			build(layer+1, l, r, betweenOffs);
		}
		if (layer == 0) {
			buildBetweenZero();
		} else {
			buildBetween(layer, lBound, rBound, betweenOffs);
		}
	}
	
	void update(int layer, int lBound, int rBound, int betweenOffs, int x) {
		if (layer >= (int)layers.size()) {
			return;
		}
		int bSzLog = (layers[layer]+1) >> 1;
		int bSz = 1 << bSzLog;
		int blockIdx = (x - lBound) >> bSzLog;
		int l = lBound + (blockIdx << bSzLog);
		int r = min(l + bSz, rBound);
		buildBlock(layer, l, r);
		if (layer == 0) {
			updateBetweenZero(blockIdx);
		} else {
			buildBetween(layer, lBound, rBound, betweenOffs);
		}
		update(layer+1, l, r, betweenOffs, x);
	}
	
	inline SqrtTreeItem query(int l, int r, int betweenOffs, int base) {
		if (l == r) {
			return v[l];
		}
		if (l + 1 == r) {
			return op(v[l], v[r]);
		}
		int layer = onLayer[clz[(l - base) ^ (r - base)]];
		int bSzLog = (layers[layer]+1) >> 1;
		int bCntLog = layers[layer] >> 1;
		int lBound = (((l - base) >> layers[layer]) << layers[layer]) + base;
		int lBlock = ((l - lBound) >> bSzLog) + 1;
		int rBlock = ((r - lBound) >> bSzLog) - 1;
		SqrtTreeItem ans = suf[layer][l];
		if (lBlock <= rBlock) {
			SqrtTreeItem add = (layer == 0) ? (
				query(n + lBlock, n + rBlock, (1 << lg) - n, n)
			) : (
				between[layer-1][betweenOffs + lBound + (lBlock << bCntLog) + rBlock]
			);
			ans = op(ans, add);
		}
		ans = op(ans, pref[layer][r]);
		return ans;
	}
public:
	inline SqrtTreeItem query(int l, int r) {
		return query(l, r, 0, 0);
	}
	
	inline void update(int x, const SqrtTreeItem &item) {
		v[x] = item;
		update(0, 0, n, 0, x);
	}
	
	SqrtTree(const vector<SqrtTreeItem>& a)
		: n((int)a.size()), lg(log2Up(n)), v(a), clz(1 << lg), onLayer(lg+1) {
		clz[0] = 0;
		for (int i = 1; i < (int)clz.size(); i++) {
			clz[i] = clz[i >> 1] + 1;
		}
		int tlg = lg;
		while (tlg > 1) {
			onLayer[tlg] = (int)layers.size();
			layers.push_back(tlg);
			tlg = (tlg+1) >> 1;
		}
		for (int i = lg-1; i >= 0; i--) {
			onLayer[i] = max(onLayer[i], onLayer[i+1]);
		}
		int betweenLayers = max(0, (int)layers.size() - 1);
		int bSzLog = (lg+1) >> 1;
		int bSz = 1 << bSzLog;
		indexSz = (n + bSz - 1) >> bSzLog;
		v.resize(n + indexSz);
		pref.assign(layers.size(), vector<SqrtTreeItem>(n + indexSz));
		suf.assign(layers.size(), vector<SqrtTreeItem>(n + indexSz));
		between.assign(betweenLayers, vector<SqrtTreeItem>((1 << lg) + bSz));
		build(0, 0, n, 0);
	}
};

~~~~~

## Problems

[CodeChef - SEGPROD](https://www.codechef.com/NOV17/problems/SEGPROD) 
