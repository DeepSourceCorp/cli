def greet_all(names: list[str]) -> None:
    for name in names:
        print('Hello ' + name)

if __name__ == "__main__":
    heights = [5.5, 6, 5.9]
    greet_all(heights)
