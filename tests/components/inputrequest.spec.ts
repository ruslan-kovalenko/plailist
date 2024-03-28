import { mount } from '@vue/test-utils'
import InputRequest from '@/components/InputRequest.vue'

describe('InputRequest component', () => {
  it('should execute request and unset result opacity after 3 seconds', async () => {
    const mockCallback = vi.fn().mockResolvedValue(true)

    const wrapper = mount(InputRequest, {
      props: {
        callback: mockCallback
      }
    })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('Test Request')
    await input.trigger('keyup.enter')

    await wrapper.vm.$nextTick()

    expect(mockCallback).toHaveBeenCalledWith('Test Request')

    await new Promise((resolve) => setTimeout(resolve, 3000))

    expect(wrapper.vm.successMessage.style.opacity).toBe('0')
    expect(wrapper.vm.loading).toBe(false)
  })
})
