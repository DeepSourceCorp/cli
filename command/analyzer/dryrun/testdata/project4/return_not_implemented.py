class RealNumber:
    """Represents a real number."""
    def __init__(self, val): 
        self.val = val 
    
    def __add__(self, other): 
        raise NotImplementedError
         
class ComplexNumber:
    """Represents an imaginary number."""
    def __init__(self, x, y): 
        self.x = x
        self.y = y 
        
    def __add__(self, other): 
        return self.val + other.val 
     
    def __radd__(self, other): 
        res =  (self.x + other.val, self.y)
        return res

if __name__ == "__main__":
    complex_num = ComplexNumber(2, 5)
    real_num = RealNumber(32)
    return real_num + complex_num
