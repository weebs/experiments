from subprocess import Popen, PIPE
import time

class Process():
  def __init__(self, cmd, args=[]):
    self.Command = cmd
    self.child_proc = Popen(cmd + args, stdout=PIPE, stdin=PIPE)
  
  def write_line(self, line):
    self.child_proc.stdin.write(line + '\n')

  def read_line(self):
    return self.child_proc.stdout.readline().strip('\n')

# Whether to use stdout or stderr as the output stream
# for the child process
proc_use_stderr = False

# Process Variables
p = None
p_out = None
p_in = None
# Config
nrepl_num_start_lines = 11

if proc_use_stderr:
  p = Popen('lein repl 1>&2', shell=True, stderr=PIPE, stdin=PIPE)
  p_out = p.stderr
else:
  p = Popen(['/usr/local/bin/lein', 'repl'], stdout=PIPE, stdin=PIPE)
  p_out = p.stdout

p_in = p.stdin

child_output_lines = []
for i in range(0, nrepl_num_start_lines):
  child_output_lines.append(p_out.readline().strip('\n'))

# Leads to: ValueError: I/O operation on closed file
# p.communicate('(print "Hello, repl!")\n')[0]
p_in.write('(print "Hello, repl!")\n')
p_in.flush()

print 'Starting readline'
child_output_lines.append(p_out.readline().strip('\n'))
child_output_lines.append(p_out.readline().strip('\n'))
print 'Ending readline'

for i in range(0, len(child_output_lines)):
  print i, ':', child_output_lines[i]

print 'Infinite loop'
while True:
  p_in.write('(print "meow!!!")\n')
  p_in.flush()

  p_line = p_out.readline()
  if p_line:
    print p_line
  time.sleep(1)

# TODO: Terminal gets all goofy after the process exits
# p.stderr.flush()
# p.stderr.close()
p_out.flush()
p_out.close()
p_in.flush()
p_in.close()
p.terminate()

print 'Summary:'
print 'Num Received Lines:', len(child_output_lines)
print 'Line List:', child_output_lines
print 'End of script'