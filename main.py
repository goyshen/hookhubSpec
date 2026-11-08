def fibonacci(n):
    if n < 0:
        raise ValueError("n must be a non-negative integer")
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


def main():
    for i in range(10):
        print(fibonacci(i))


if __name__ == "__main__":
    main()
