__author__ = 'dave'

# Data Types
# nil, Booleans, Numbers, Strings, Maps, Keywords, Vectors, Lists, Sets

def IsWhitespace(c):
    return (c == ' ' or c == '\n' or c == '\t')

def IsEndingDataStructureCharacter(c):
    return (c == ')' or c == '}' or c == ']')

def IsBeginningDataStructureCharacter(c):
    return (c == '(' or c == '{' or c == '[')

def Tokenize(src):
    current_token = ''
    within_string = False
    tokens = []

    line_number = 1
    line_column = 0
    for c in src:
        # Tracking Line and Column numbers for reporting errors
        line_column += 1
        if (c == '\n'):
            line_number += 1
            line_column = 0

        # If we reach whitespace: clear token and push it onto the list
        if IsWhitespace(c) and (not within_string) and current_token != '':
            tokens.append(current_token)
            current_token = ''

        # Data structure character (not within a string)
        elif (not within_string) and IsBeginningDataStructureCharacter(c):
            # Prevent something named like th{is from starting a data structure.
            if (current_token != ''):
                exit('Fuck. current_token was not empty at a special char: ' + c + '\nLine: ' + str(line_number) + '\nColumn: ' + str(line_column))
            tokens.append(c)

        elif (not within_string) and IsEndingDataStructureCharacter(c):
            if current_token != '':
                tokens.append(current_token)
                current_token = ''
            tokens.append(c)

        # Beginning or Ending a quote. 
        # TODO: String escape characters
        elif c == '"':
            current_token += c

            if (within_string):
                tokens.append(current_token)
                current_token = ''

            within_string = not within_string

        # Within a token. Append char to current token
        else:
            if (not IsWhitespace(c)):
                current_token += c

    # In case we have a left over token that didn't get pushed.
    # TODO: Is this necessary?
    if current_token != '':
        tokens.append(current_token)

    return tokens

def Listify(tokens):
    listified = []

    multi_tokens_stack = []
    multi_token_type_stack = []

    token_counter = 0
    for token in tokens:
        token_counter += 1
        # TODO: All 3 of these composite tokens logic could probably be
        # TOOD: put into 1 thingy

        # ( - Creating new list
        if token == '(':
            # multi_token_type_stack.append(token)
            multi_tokens_stack.append([])
        # ) - Finished list. Pop it off stack and append it to next last element
        elif token == '{':
            multi_tokens_stack.append([])
            multi_tokens_stack[-1].append('hash-map')
        elif token == '[':
            multi_tokens_stack.append([])
            multi_tokens_stack[-1].append('vector')
        elif token == ']' or token == '}' or token == ')':
            tmp = multi_tokens_stack.pop()
            if len(multi_tokens_stack) == 0:
                # TODO: Checking to make sure we're at end of stack
                return tmp
            multi_tokens_stack[-1].append(tmp)

        # If not starting/ending a composite data structure,
        # append the token to the last structure on the stack
        else:
            multi_tokens_stack[-1].append(token)

    return multi_tokens_stack[-1]

class LispObject():
    def __init__(self, token):
        self.Value = token

    def __str__(self):
        return self.Value


class CompositeLispObject():
    def __init__(self, token):
        self.Type = token[0]
        self.Objects = []
        for i in range(1, len(token)):
            if type(token) == str:
                self.Objects.append(LispObject(token))
            elif type(token[i]) == list:
                self.Objects.append(CompositeLispObject(token))

    def __str__(self):
        return str(self.Objects)

# TODO: This will take the Listified tokens and turn them into actual Lisp objects
def CreateObjectTree(source_list):
    # Plural. As we may have something like: { 1 2 3 } (print "hello")
    object_trees = []
    for token in source_list:
        if type(token) == str:
            object_trees.append(LispObject(token))
        elif type(token) == list:
            if token[0] == 'list' or token[0] == 'vector' or token[0] == 'hash-map':
                object_trees.append(CompositeLispObject(token))
            # elif token[0] == 'vector':
            # elif token[0] == 'hash-map':

            # Is a binding or a value (print, 1, "foo", :bar)
            else:
                # TODO
                print(token)

    return object_trees

# TODO: This only gets parsed as { a } / (hash-map a)
str_repl = '{ a } (print "hi" "bye" (list 1) 1 {} 2 "foo")'
str_source = '(list print "hi" "bye" (list 1) 1 { 12 24 :merp "derp" } [ 3 4 ] 2 "foo")'
source_code = '(print (list 1 2 3))'

# print(Tokenize(str_repl))
# print(Tokenize(str_source))
# print(Tokenize(source_code))
# print(Listify(Tokenize(str_repl)))
# print(Listify(Tokenize(str_source)))
# print(Listify(Tokenize(source_code)))
src_tokens = Tokenize(str_source)
src_listified = Listify(src_tokens)
for obj in CreateObjectTree(src_listified):
    print(obj)