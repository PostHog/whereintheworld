class TransactionalIDConverter:
    regex = "[a-z]{2,5}_[a-zA-Z0-9]{24}"

    def to_python(self, value):
        return value

    def to_url(self, value):
        return value
