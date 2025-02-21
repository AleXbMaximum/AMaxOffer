import base64
import random
import json


def encode_url(url: str) -> str:
    """Encodes a URL string into Base64 and applies secondary encoding."""
    base64_encoded = base64.b64encode(url.encode('utf-8')).decode('utf-8')
    secondary_encoded = base64.b64encode(
        base64_encoded.encode('utf-8')).decode('utf-8')
    return secondary_encoded


def decode_url(encoded: str) -> str:
    """Decodes the doubly encoded Base64 string back to a URL."""
    first_decoding = base64.b64decode(encoded.encode('utf-8')).decode('utf-8')
    original_url = base64.b64decode(
        first_decoding.encode('utf-8')).decode('utf-8')
    return original_url


def split_obfuscate(encoded_str: str, segments: int = 5) -> tuple:
    """Splits an encoded string into randomly sized segments and shuffles them."""
    segment_sizes = sorted(random.sample(
        range(1, len(encoded_str)), segments - 1))
    split_segments = [encoded_str[i:j]
                      for i, j in zip([0] + segment_sizes, segment_sizes + [None])]

    # Shuffle segments
    shuffled_segments = split_segments[:]
    random.shuffle(shuffled_segments)

    # Inject noise (random characters)
    noise_chars = "!@#$%^&*()_+"
    noisy_segments = [seg + random.choice(noise_chars)
                      for seg in shuffled_segments]

    # Store original index mapping
    index_mapping = {i: shuffled_segments.index(
        seg) for i, seg in enumerate(split_segments)}

    return noisy_segments, index_mapping


def reconstruct_and_decode(noisy_segments: list, index_mapping: dict) -> str:
    """Reconstructs the encoded string from shuffled segments, removes noise, and decodes."""
    # Sort based on original order and remove noise
    sorted_segments = sorted(noisy_segments, key=lambda x: list(index_mapping.keys())[
                             list(index_mapping.values()).index(noisy_segments.index(x))])
    # Remove last character (noise)
    cleaned_segments = [seg[:-1] for seg in sorted_segments]
    merged_encoded = ''.join(cleaned_segments)

    # Decode the reconstructed Base64 string
    return decode_url(merged_encoded)


if __name__ == "__main__":
    # Example URLs
    urls = [
        "https://global.americanexpress.com/api/servicing/v1/member",
        "https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1",
        "https://functions.americanexpress.com/ReadCardAccountOffersList.v1",
        "https://www.uscardforum.com/session/current.json",
        "https://www.uscardforum.com/u/",
        "https://global.americanexpress.com/api/servicing/v1/financials/balances?extended_details=deferred,non_deferred,pay_in_full,pay_over_time,early_pay",
        "https://global.americanexpress.com/api/servicing/v1/financials/transaction_summary?status=pending"
    ]

    for url in urls:
        encoded = encode_url(url)
        noisy_segments, index_mapping = split_obfuscate(
            encoded, 12)  # Obfuscate

        print(f"Original URL: {url}")
        print(f"Encoded URL (before obfuscation): {encoded}\n")

        print("Obfuscated Segments (shuffled with noise):")
        for i, seg in enumerate(noisy_segments, 1):
            print(f"  Part {i}: {seg}")

        print("\nIndex Mapping (Original Order):",
              json.dumps(index_mapping, indent=2))

        reconstructed_url = reconstruct_and_decode(
            noisy_segments, index_mapping)

        print(f"\nDecoded URL: {reconstructed_url}")
        print("=" * 80)
