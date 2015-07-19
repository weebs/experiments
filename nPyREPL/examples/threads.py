# Article: Python Module of the Week - Threads
# http://pymotw.com/2/threading/

import threading
import time
# Unlike print, logging is thread safe
import logging

logging.basicConfig(
  level=logging.DEBUG,
  # %(varName)-Xs: X is the minimum column width
  format='[%(levelname)s (%(threadName)-30s) %(message)s'
  )

def worker(thread_num, another_arg):
  """Thread Worker Function"""
  # print 'Starting Thread:', threading.currentThread().getName()
  logging.debug('Starting')
  time.sleep(1)
  if thread_num == 2:
    x = 1
    # logging.debug('Thread 2, stopping')
    # threading.currentThread().stop()
  logging.debug('Exiting')

# threads = []
for i in range(5):
  t = threading.Thread(target=worker, args=(i,1337), name='Worker ' + str(i))
  # threads.append(t)
  t.setDaemon(True)
  t.start()
  # A thread can be started as a daemon with: t.setDaemon(True)
  # This is useful if you don't care about the thread exiting
  # in the middle of its execution (e.g. a ping/hearbeat thread)
  # You can wait until a daemon has completed its work with t.join()
  #   - You can also set a timout: t.join(float:numSeconds)

  # threading.enumerate() generates a list of all threads,
  # including the current thread
  if i == 3:
    logging.debug('Mainthread 3 exiting')
    exit(3)

# The Thread class can also be inherited.
# Thread does some initialization, and then calls run()
class MyThread(threading.Thread):
  def run(self):
    logging.debug('running')
    return

# =====Sharing Data=====
# Build in data structures such as lists and dictionaries are thread safe
# Simpler types like integers and floats do not offer this protection
# This requires the use of locks
# lock = threading.Lock()
# lock.acquire()
# try:
#   do stuff with lock
# finally:
#   lock.release()