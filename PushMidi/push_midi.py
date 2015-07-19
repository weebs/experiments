__author__ = 'dave'

import pygame
import pygame.midi
from time import sleep

pygame.init()
pyg_midi = pygame.midi
pyg_midi.init()

num_devices = pyg_midi.get_count()
for i in range(0, num_devices):
    print i, pyg_midi.get_device_info(i)

print 'Default Input ID:', pyg_midi.get_default_input_id()
print 'Default Output ID:', pyg_midi.get_default_output_id()
push_in = pyg_midi.Input(pyg_midi.get_default_input_id())
push_out = pyg_midi.Output(pyg_midi.get_default_output_id(), 0)

sysex_live_mode = '\xF0\x47\x7F\x15\x62\x00\x01\x00\xF7'
sysex_user_mode = '\xF0\x47\x7F\x15\x62\x00\x01\x01\xF7'

push_out.write_sys_ex(0, sysex_live_mode)

counter = 0

while True:
    stuffs = []
    newData = False
    if (push_in.poll()):
        newData = True
        counter += 1
    while (push_in.poll()):
        stuffs.append(push_in.read(1))

    if (newData):
        print 'Iteration', counter, ':', stuffs
        for stuff in stuffs:
            print stuff


    sleep(0.5)

del push_out
del push_in
pyg_midi.quit()