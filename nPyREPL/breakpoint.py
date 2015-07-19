from subprocess import Popen, PIPE
import time
import threading
import logging
from Queue import Queue
from Tkinter import *

logging.basicConfig(
  level=logging.DEBUG,
  # %(varName)-Xs: X is the minimum column width
  format='[%(levelname)s (%(threadName)-10s) %(message)s'
  )

def debug(s):
  logging.debug(s)

# TkInter book
# http://effbot.org/tkinterbook/

class App:
  def __init__(self, master, line_queue, proc):
    self.line_queue = line_queue
    self.process = proc
    frame = Frame(master)
    frame.pack()

    self.button = Button(frame, text='Quit', fg='red', command=frame.quit)
    self.button.pack(side=LEFT)
    self.hi_there = Button(frame, text='Pop Message', command=self.print_queue)
    self.hi_there.pack(side=LEFT)
    self.btn_write_line = Button(frame, text='Write Line', command=self.write_line)
    import pdb; pdb.set_trace()  # breakpoint 6be37329 //
    self.btn_write_line.pack(side=LEFT)
    self.btn_dump_messages = Button(frame, text='Dump Messages', command=self.dump_messages)
    self.btn_dump_messages.pack(side=LEFT)

    self.entry = Entry(frame, text='(println "Meow!")', width=50)
    self.entry.pack(side=LEFT)

  def print_queue(self):
    debug('Queue Count: ' + str(self.line_queue.qsize()))
    if (self.line_queue.qsize() > 0):
      msg = self.line_queue.get()
      debug('Got Message: ' + msg)

  def write_line(self):
    to_write = self.entry.get()
    self.process.write_line(to_write)

  def dump_messages(self):
    msgs = []
    while (self.line_queue.qsize() > 0):
      msgs.append(self.line_queue.get())
    for msg in msgs:
      debug(msg) # \n is at end of line. Weird escape chars happen before it

def app_loop(proc):
  # Write some initial data
  proc.write_line('(println "Meow!")')
  proc.write_line('(println "Dingus?")')
  proc.write_line('{ :a "my-map" }')
  root = Tk()
  app = App(root, proc.line_queue, proc)
  root.mainloop()
  # TODO: Do I need this?
  root.destroy()

class ProcessMessage():
  def __init__(self, s):
    self.message = s.strip('\n')

  def __str__(self):
    repl_prompt = 'user=>'
    if self.message.startswith(repl_prompt):
      return self.message[:-14]
    else:
      return self.message

class Process():
  def __init__(self, cmd, args=[]):
    self.Command = cmd
    self.child_proc = Popen([ cmd ] + args, stdout=PIPE, stdin=PIPE)
    self.line_queue = Queue()
  
  def write_line(self, line):
    self.child_proc.stdin.write(line + '\n')

  def read_line(self):
    line = self.child_proc.stdout.readline()#.strip('\n')
    self.line_queue.put(ProcessMessage(line))
    return line


def reader_loop(p):
  while True:
    p.read_line()

p = Process('/usr/local/bin/lein', ['repl'])
t_reader = threading.Thread(target=reader_loop, args=(p,), name='ReaderThread')
t_reader.setDaemon(True)
t_reader.start()

app_loop(p)
