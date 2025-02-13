import base64


def encode_url(url: str) -> str:
    """Encodes a URL string into Base64."""
    return base64.b64encode(url.encode('utf-8')).decode('utf-8')


def decode_url(encoded: str) -> str:
    """Decodes a Base64‑encoded string back to a URL."""
    return base64.b64decode(encoded.encode('utf-8')).decode('utf-8')


if __name__ == "__main__":
    # Example URLs
    urls = [
        "https://global.americanexpress.com/api/servicing/v1/member",
        "https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1",
        "https://functions.americanexpress.com/ReadCardAccountOffersList.v1"
    ]

    for url in urls:
        encoded = encode_url(url)
        decoded = decode_url(encoded)
        print(f"Original URL: {url}")
        print(f"Encoded URL:  {encoded}")
        print(f"Decoded URL:  {decoded}")
        print("-" * 40)
