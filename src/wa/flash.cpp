#include <stdio.h>

#ifdef __EMSCRIPTEN__
  #include <emscripten.h>
#endif

#ifdef __cplusplus
// So that the C++ compiler does not rename our function names
extern "C" {
    extern void open();
    extern void close();
    extern uint8_t* transferIn();
    extern void transferOut(const uint8_t* data);
    extern int showMessage(const char* message);
#endif

    int IsPrime(int value) {
        if (value == 2) {
            return 1;
        }

        if (value <= 1 || value %2 == 0) {
            return 0;
        }

        for (int i = 3; (i * i) <= value; i += 2) {
            if (value % i == 0) {
                return 0;
            }
        }

        return 1;
    }

#ifdef __EMSCRIPTEN__
  EMSCRIPTEN_KEEPALIVE
#endif
    int GetPrimes(int end) {
        int start = 3;

        printf("Primes between %d and %d:\n", start, end);

        for (int i = start; i <= end; i += 2) {
            if (IsPrime(i)) {
                printf("%d", i);
            }
        }

        printf("\n");
        char buff[100];
        sprintf(buff,"completed to %d", end);
        int success = showMessage(buff);
        printf("2: WEEEEEEE %d\n", success);

        return end;
    }

#ifdef __cplusplus
}
#endif
