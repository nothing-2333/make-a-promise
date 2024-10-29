const PENDING = "pending"
const FULFILLED = "fulfilled"
const REJECTED = "rejected"

/**
 * 封装异步
 */
function runAsynctask(callback)
{
    if (typeof queueMicrotask == "function")
    {
        queueMicrotask(callback);
    }
    else if (typeof MutationObserver == "function")
    {
        const obs = new MutationObserver(callback);
        const divNode = document.createElement("div");
        obs.observe(divNode, { childList: true });
        divNode.innerHTML = "runAsynctask";
    }
    else
    {
        setTimeout(callback, 0);
    }
}

class MyPromise
{
    state = PENDING;
    result = undefined;
    #handlers = []
    
    constructor(func)
    {
        const resolve = (result) => {
            if (this.state != PENDING) return ;
            this.state = FULFILLED;
            this.result = result;

            this.#handlers.forEach(({ onFulfilled }) => {
                onFulfilled()
            })
        };
        const reject = (result) => {
            if (this.state != PENDING) return ;
            this.state = REJECTED;
            this.result = result;

            this.#handlers.forEach(({ onRejected }) => {
                onRejected()
            })
        };

        try {
            func(resolve, reject);
        } catch (error) {
            reject(error);
        }
        
    }

    then(onFulfilled, onRejected)
    {
        if (typeof onFulfilled != "function") onFulfilled = (x => x);
        if (typeof onRejected != "function") onRejected = (x => { throw x });

        const p2 = new MyPromise((resolve, reject) => {
            if (this.state == FULFILLED)
            {
                runAsynctask(() => {
                    try {
                        const x = onFulfilled(this.result);
                        if (x === p2) 
                            throw new TypeError("Chaining cycle detected for promise #<Promise>");
                            
                        if (x instanceof MyPromise) x.then(res => resolve(res), err => reject(err));
                        else resolve(x);
                    } catch (error) {
                        reject(error);
                    }
                });
            }
            else if (this.state == REJECTED)
            {
                runAsynctask(() => {
                    try {
                        const x = onRejected(this.result);
                        resolvePromise(p2, x, resolve, reject)
                    } catch (error) {
                        reject(error);
                    }
                });
            }
            else if (this.state == PENDING)
            {
                this.#handlers.push({ 
                    onFulfilled: () => {
                        runAsynctask(() => {
                            try {
                                const x = onFulfilled(this.result);
                                resolvePromise(p2, x, resolve, reject)
                            } catch (error) {
                                reject(error);
                            }
                        })
                    },
                    onRejected: () => {
                        runAsynctask(() => {
                            try {
                                const x = onRejected(this.result);
                                resolvePromise(p2, x, resolve, reject)
                            } catch (error) {
                                reject(error);
                            }
                        });
                    }
                });
            }
        });

        return p2;
    }

    catch(onRejected)
    {
        return this.then(undefined, onRejected);
    }

    finally(onFinally)
    {
        return this.then(onFinally, onFinally);
    }

    static resolve(value)
    {
        if (value instanceof MyPromise) return value;

        return new MyPromise((resolve) => {
            resolve(value);
        })
    }

    static reject(value)
    {
        // if (value instanceof MyPromise) return value;

        return new MyPromise((undefined, reject) => {
            reject(value);
        })
    }

    static race(promises)
    {
        return new MyPromise((resolve, reject) => {
            if (!Array.isArray(promises)) reject(new TypeError("Argument is not iterable"));

            promises.forEach(p =>{
                MyPromise.resolve(p).then(res => { resolve(res) }, err => { reject(err) });
            });
        })
    }

    static all(promises)
    {
        return new MyPromise((resolve, reject) => {
            if (!Array.isArray(promises)) reject(new TypeError("Argument is not iterable"));
            promises.length == 0 && resolve(promises);

            const results = [];
            let count = 0;
            promises.forEach((p, index) =>{
                MyPromise.resolve(p).then(
                    res => {
                        results[index] = res;
                        count++;
                        count == promises.length && resolve(results);
                    }, 
                    err => {
                        reject(err) 
                    }
                );
            });
        })
    }

    static allSettled(promises)
    {
        return new MyPromise((resolve, reject) => {
            if (!Array.isArray(promises)) reject(new TypeError("Argument is not iterable"));
            promises.length == 0 && resolve(promises);

            const results = [];
            let count = 0;
            promises.forEach((p, index) =>{
                MyPromise.resolve(p).then(
                    res => {
                        results[index] = { status: FULFILLED, value: res };
                        count++;
                        count == promises.length && resolve(results);
                    }, 
                    err => {
                        results[index] = { status: REJECTED, value: err };
                        count++;
                        count == promises.length && resolve(results);
                    }
                );
            });
        })
    }

    static any(promises)
    {
        return new MyPromise((resolve, reject) => {
            if (!Array.isArray(promises)) reject(new TypeError("Argument is not iterable"));
            promises.length == 0 && reject(new AggregateError(promises, "All promises were rejected"));

            const errors = [];
            let count = 0;
            promises.forEach((p, index) =>{
                MyPromise.resolve(p).then(
                    res => {
                        resolve(res);
                    }, 
                    err => {
                        errors[index] = err;
                        count++;
                        count == promises.length && reject(new AggregateError(errors, "All promises were rejected"));
                    }
                );
            });
        })
    }
}

// 内置函数
function resolvePromise(p2, x, resolve, reject) {
    if (x === p2) 
        throw new TypeError("Chaining cycle detected for promise #<Promise>");
        
    if (x instanceof MyPromise) x.then(res => resolve(res), err => reject(err));
    else resolve(x);
}



// ---------------------- 测试 ----------------------
let p1 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        reject(1)
    }, 200);
})
let p2 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        reject(2)
    }, 1000);
})

MyPromise.any([p1, p2]).then(res => {
    console.log("res", res)
}, err => {
    console.log(err)
});


