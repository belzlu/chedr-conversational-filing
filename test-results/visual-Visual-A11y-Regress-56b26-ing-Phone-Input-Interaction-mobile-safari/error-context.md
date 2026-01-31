# Page snapshot

```yaml
- generic [ref=e5]:
  - banner [ref=e6]:
    - generic [ref=e7]:
      - img [ref=e9]
      - heading "Chedr" [level=1] [ref=e11]
    - button "Show Form" [ref=e12] [cursor=pointer]
  - main [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e17]: Let's get you filed.
        - generic [ref=e19]: What's your phone number?
        - generic [ref=e21]:
          - generic [ref=e22]:
            - generic [ref=e23]: "+1"
            - textbox "Phone number" [active] [ref=e24]:
              - /placeholder: (555) 555-5555
              - text: (555) 123-4567
            - button "Verify phone number" [ref=e25] [cursor=pointer]: Verify
          - paragraph [ref=e26]: We'll text you a code.
      - generic [ref=e28]:
        - img [ref=e29]
        - text: Bank-level encryption
```