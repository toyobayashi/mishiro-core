#include <stdlib.h>
#include <memory.h>
#include "lz4.h"
#include "lz4dec.h"

static uint32_t read_uint32_le(const uint8_t* buf, int offset) {
  uint32_t first = *(buf + offset);
  uint32_t second = (uint32_t)(*(buf + offset + 1)) << 8;
  uint32_t third = (uint32_t)(*(buf + offset + 2)) << 16;
  uint32_t fourth = (uint32_t)(*(buf + offset + 3)) << 24;
  return first + second + third + fourth;
}

uint32_t lz4_get_uncompressed_size(const uint8_t* buf, size_t buflen) {
  if (buf == NULL || buflen < 16) return 0;
  return read_uint32_le(buf, 4);
}

int lz4_dec_buffer(const uint8_t* buf, size_t buflen, uint8_t* out, size_t outlen) {
  uint32_t uncompressed_size = read_uint32_le(buf, 4);
  uint32_t compressed_size = read_uint32_le(buf, 8);

  if (uncompressed_size == compressed_size) {
    if (outlen < compressed_size) {
      size_t bufrest = buflen - 16;
      if (bufrest < outlen) {
        memcpy(out, buf + 16, bufrest);
        return bufrest;
      }
      memcpy(out, buf + 16, outlen);
      return outlen;
    }
    memcpy(out, buf + 16, compressed_size);
    return compressed_size;
  }

  char* compressed_data = (char*)malloc(compressed_size);
  memcpy(compressed_data, buf + 16, compressed_size);
  const int decompressed_size = LZ4_decompress_safe(compressed_data, (char*)out, compressed_size, outlen);
  free(compressed_data);

  return decompressed_size;
}
