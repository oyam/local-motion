import { X } from 'lucide-react'
import { useRef, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useMotionSettings } from '@/providers/motion-settings-provider'
import { cn } from '@/lib/utils'
import type { MotionBoxPosition } from '@/types/settings'
import { MOTION_BOX_POSITION_CANDIDATES } from '@/constants'
import { getDefaultMotionSettings } from '@/utils/settings'

const motionFormSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, {
      message: 'Motion Name must be at least 1 character.'
    })
    .max(50, {
      message: 'Motion Name must not be longer than 50 characters.'
    }),
  description: z.string(),
  globalShortcutKey: z.string(),
  detectorType: z.enum(['default', 'custom']),
  detectorUrl: z.string(),
  windowWidth: z.coerce.number().positive().int(),
  windowHeight: z.coerce.number().positive().int(),
  windowBackgroundColor: z.string(),
  fontSize: z.coerce.number().positive().int(),
  textColor: z.string(),
  textBoxColor: z.string(),
  postAction: z.enum([
    'none',
    'left-click',
    'right-click',
    'middle-click',
    'double-left-click'
  ]),
  motionBoxPositions: z.array(
    z.object({
      value: z.enum([
        'center',
        'top-left',
        'top-middle',
        'top-right',
        'middle-left',
        'middle-right',
        'bottom-left',
        'bottom-middle',
        'bottom-right'
      ])
    })
  )
})

type MotionFormValues = z.infer<typeof motionFormSchema>

type MotionFormProps = {
  motionId: string
}

export function MotionForm({ motionId }: MotionFormProps) {
  const { motionSettingsList, setMotionSettings } = useMotionSettings()
  const filteredMotionSettings = motionSettingsList.filter(
    (motionSettings) => motionSettings.id === motionId
  )
  let motionSettings = getDefaultMotionSettings(motionId)
  if (filteredMotionSettings.length > 0) {
    motionSettings = filteredMotionSettings[0]
  }
  const defaultValues: Partial<MotionFormValues> = {
    ...motionSettings,
    motionBoxPositions: motionSettings.motionBoxPositions.map((position) => ({
      value: position
    }))
  }
  const form = useForm<MotionFormValues>({
    resolver: zodResolver(motionFormSchema),
    defaultValues,
    mode: 'onChange'
  })
  const { isValidating, isValid } = form.formState
  const name = form.watch('name')
  const description = form.watch('description')
  const globalShortcutKey = form.watch('globalShortcutKey')
  const detectorType = form.watch('detectorType')
  const prevDetectorType = useRef(defaultValues.detectorType)
  const detectorUrl = form.watch('detectorUrl')
  const windowWidth = form.watch('windowWidth')
  const windowHeight = form.watch('windowHeight')
  const windowBackgroundColor = form.watch('windowBackgroundColor')
  const fontSize = form.watch('fontSize')
  const textColor = form.watch('textColor')
  const textBoxColor = form.watch('textBoxColor')
  const postAction = form.watch('postAction')
  const motionBoxPositions = form.watch('motionBoxPositions')
  useEffect(() => {
    if (prevDetectorType.current === 'custom' && detectorType === 'default') {
      prevDetectorType.current = detectorType
      form.setValue('detectorUrl', '') // invoke this useEffect again
      return // return here to avoid call setMotionSettings twice
    }
    prevDetectorType.current = detectorType
    if (isValid && !isValidating) {
      const motionSettings = motionSettingsList.filter(
        (motion) => motion.id === motionId
      )[0]
      setMotionSettings({
        ...motionSettings,
        name: name,
        description: description,
        globalShortcutKey: globalShortcutKey,
        detectorType: detectorType,
        detectorUrl: detectorUrl,
        windowWidth: Number(windowWidth),
        windowHeight: Number(windowHeight),
        windowBackgroundColor: windowBackgroundColor,
        fontSize: Number(fontSize),
        textColor: textColor,
        textBoxColor: textBoxColor,
        postAction: postAction,
        motionBoxPositions: motionBoxPositions.map((pos) => pos.value)
      })
    }
  }, [
    name,
    description,
    globalShortcutKey,
    detectorType,
    detectorUrl,
    windowWidth,
    windowHeight,
    windowBackgroundColor,
    fontSize,
    textColor,
    textBoxColor,
    postAction,
    motionBoxPositions,
    isValid,
    isValidating
  ])
  const { fields, append, remove } = useFieldArray({
    name: 'motionBoxPositions',
    control: form.control
  })
  const isUnusedBoxPos = (
    targetPos: MotionBoxPosition,
    currentPos: MotionBoxPosition
  ): boolean => {
    if (targetPos === currentPos) {
      return true
    }
    const usedPositions = fields.map((field) => field.value)
    return !usedPositions.includes(targetPos)
  }
  const nextDefaultBoxPos = (): MotionBoxPosition | null => {
    const currentPositions = fields.map((field) => field.value)
    const restPos = MOTION_BOX_POSITION_CANDIDATES.filter((pos) => {
      return !currentPositions.includes(pos)
    })
    if (restPos.length > 0) {
      return restPos[0]
    }
    return null
  }
  const onChangeBoxPos = (index: number, value: MotionBoxPosition): void => {
    form.setValue(
      'motionBoxPositions',
      fields.map((field, i) => {
        if (i === index) {
          return { value: value }
        }
        return field
      })
    )
  }

  return (
    <>
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motion Name</FormLabel>
                <FormControl>
                  <Input
                    className="sm:max-w-[300px]"
                    placeholder="Your Motion"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description of the motion"
                    className="resize-none h-[75px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="globalShortcutKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shortcut Key</FormLabel>
                <FormControl>
                  <Input
                    className="sm:max-w-[300px]"
                    placeholder=""
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="detectorType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detector Type</FormLabel>
                <div className="sm:max-w-[300px]">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a detector type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default">
                        Default (Icon-String Detector)
                      </SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {detectorType === 'custom' && (
            <FormField
              control={form.control}
              name="detectorUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detector URL</FormLabel>
                  <FormControl>
                    <Input
                      className="sm:max-w-[300px]"
                      placeholder=""
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="windowWidth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Window Width</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="200"
                    className="sm:max-w-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="windowHeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Window Height</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="200"
                    className="sm:max-w-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="windowBackgroundColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Window Background Color</FormLabel>
                <FormControl>
                  <Input
                    placeholder="rgba(255, 255, 255, 0.1)"
                    className="sm:max-w-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fontSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Font Size of Letters for Motion</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="15"
                    className="sm:max-w-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color of Letters for Motion</FormLabel>
                <FormControl>
                  <Input
                    placeholder="rgba(255, 255, 255, 1)"
                    className="sm:max-w-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textBoxColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color of Box around a Letters for Motion</FormLabel>
                <FormControl>
                  <Input
                    placeholder="rgba(255, 197, 66, 1)"
                    className="sm:max-w-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postAction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Action</FormLabel>
                <div className="sm:max-w-[300px]">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a post action after motion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="left-click">Left click</SelectItem>
                      <SelectItem value="right-click">Right click</SelectItem>
                      <SelectItem value="middle-click">Middle click</SelectItem>
                      <SelectItem value="double-left-click">
                        Double left click
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            {fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`motionBoxPositions.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && 'sr-only')}>
                      Motion Box Positions
                    </FormLabel>
                    <FormDescription className={cn(index !== 0 && 'sr-only')}>
                      Select the positions which are candidates of the motion in
                      each box
                    </FormDescription>
                    <div className="flex sm:max-w-[300px]">
                      <Select
                        // onValueChange={field.onChange}
                        onValueChange={(changedVal: MotionBoxPosition) =>
                          onChangeBoxPos(index, changedVal)
                        }
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a post action after motion" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isUnusedBoxPos('center', field.value) && (
                            <SelectItem value="center">center</SelectItem>
                          )}
                          {isUnusedBoxPos('top-left', field.value) && (
                            <SelectItem value="top-left">top-left</SelectItem>
                          )}
                          {isUnusedBoxPos('top-middle', field.value) && (
                            <SelectItem value="top-middle">
                              top-middle
                            </SelectItem>
                          )}
                          {isUnusedBoxPos('top-right', field.value) && (
                            <SelectItem value="top-right">top-right</SelectItem>
                          )}
                          {isUnusedBoxPos('middle-left', field.value) && (
                            <SelectItem value="middle-left">
                              middle-left
                            </SelectItem>
                          )}
                          {isUnusedBoxPos('middle-right', field.value) && (
                            <SelectItem value="middle-right">
                              middle-right
                            </SelectItem>
                          )}
                          {isUnusedBoxPos('bottom-left', field.value) && (
                            <SelectItem value="bottom-left">
                              bottom-left
                            </SelectItem>
                          )}
                          {isUnusedBoxPos('bottom-middle', field.value) && (
                            <SelectItem value="bottom-middle">
                              bottom-middle
                            </SelectItem>
                          )}
                          {isUnusedBoxPos('bottom-right', field.value) && (
                            <SelectItem value="bottom-right">
                              bottom-right
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <div className="p-1 px-2">
                        {motionBoxPositions.length > 1 ? (
                          <X onClick={() => remove(index)} />
                        ) : (
                          <X className="invisible" />
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            {nextDefaultBoxPos() ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  const nextPos = nextDefaultBoxPos()
                  if (nextPos) {
                    append({ value: nextPos })
                  }
                }}
              >
                Add Position
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                disabled
              >
                Add Position
              </Button>
            )}
          </div>
        </form>
      </Form>
    </>
  )
}
