#ifndef __CORE_LZ4DEC_H__
#define __CORE_LZ4DEC_H__

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

uint32_t lz4_get_uncompressed_size(const uint8_t* buf, size_t buflen);
int lz4_dec_buffer(const uint8_t* buf, size_t buflen, uint8_t* out, size_t outlen);

#ifdef __cplusplus
}
#endif

#endif
